const Transaction = require('../models/Transaction');
const SupplierBill = require('../models/SupplierBill');
const Buyer = require('../models/Buyer');
const Supplier = require('../models/Supplier');
const Expense = require('../models/Expense');
const Settings = require('../models/Settings');
const User = require('../models/User');

exports.getDailyBusinessReport = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Execute sales, purchases, and expenses concurrently in a single Promise.all batch
    const [sales, purchases, expenses] = await Promise.all([
      Transaction.find({
        transactionDate: { $gte: start, $lte: end },
        isVoid: false
      })
        .select('transactionDate type billAmount bigBoxes smallBoxes bigEquivalent amountPaid')
        .lean(),

      SupplierBill.find({
        transactionDate: { $gte: start, $lte: end },
        isVoid: false
      })
        .select('transactionDate grossTotal items')
        .lean(),

      Expense.find({
        date: { $gte: start, $lte: end },
        isVoid: false
      })
        .select('date amount')
        .lean()
    ]);

    // Group by Date YYYY-MM-DD (using local date formatting to prevent timezone shift)
    const dateMap = {};

    const getDateKey = (d) => {
      const dt = new Date(d);
      const year = dt.getFullYear();
      const month = String(dt.getMonth() + 1).padStart(2, '0');
      const day = String(dt.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const ensureDateKey = (key) => {
      if (!dateMap[key]) {
        dateMap[key] = {
          date: key,
          inwardBigBoxes: 0,
          inwardSmallBoxes: 0,
          inwardBigEqv: 0,
          purchaseValue: 0,
          salesBigBoxes: 0,
          salesSmallBoxes: 0,
          salesBigEqv: 0,
          salesValue: 0,
          collections: 0,
          expenses: 0
        };
      }
      return dateMap[key];
    };

    // Initialize days in range
    let curr = new Date(start);
    while (curr <= end || getDateKey(curr) <= getDateKey(end)) {
      const key = getDateKey(curr);
      ensureDateKey(key);
      if (getDateKey(curr) === getDateKey(end)) break;
      curr.setDate(curr.getDate() + 1);
    }

    purchases.forEach(p => {
      const key = getDateKey(p.transactionDate);
      const row = ensureDateKey(key);
      row.purchaseValue += p.grossTotal || 0;
      if (p.items) {
        p.items.forEach(it => {
          row.inwardBigBoxes += it.bigBoxes || 0;
          row.inwardSmallBoxes += it.smallBoxes || 0;
          row.inwardBigEqv += it.bigEquivalent || (it.quantity || 0);
        });
      }
    });

    sales.forEach(s => {
      const key = getDateKey(s.transactionDate);
      const row = ensureDateKey(key);
      if (s.type === 'SALE') {
        row.salesValue += s.billAmount || 0;
        row.salesBigBoxes += s.bigBoxes || 0;
        row.salesSmallBoxes += s.smallBoxes || 0;
        row.salesBigEqv += s.bigEquivalent || 0;
        row.collections += s.amountPaid || 0;
      } else if (s.type === 'PAYMENT') {
        row.collections += s.amountPaid || 0;
      }
    });

    expenses.forEach(e => {
      const key = getDateKey(e.date);
      const row = ensureDateKey(key);
      row.expenses += e.amount || 0;
    });

    const reportRows = Object.values(dateMap).sort((a, b) => b.date.localeCompare(a.date));

    res.json({
      success: true,
      startDate: getDateKey(start),
      endDate: getDateKey(end),
      report: reportRows
    });
  } catch (error) {
    next(error);
  }
};

exports.getAgingReport = async (req, res, next) => {
  try {
    const buyers = await Buyer.find({ isActive: true, currentBalance: { $gt: 0 } })
      .select('name phone buyerCode currentBalance createdAt')
      .sort({ currentBalance: -1 })
      .lean();

    const buyerIds = buyers.map(b => b._id);
    
    // Batch lookup all last active transaction dates in a single aggregation pipeline
    const lastTxns = await Transaction.aggregate([
      { $match: { buyerId: { $in: buyerIds }, isVoid: false } },
      { $sort: { transactionDate: -1, createdAt: -1 } },
      { $group: { _id: '$buyerId', lastDate: { $first: '$transactionDate' } } }
    ]);

    const lastDateMap = new Map();
    lastTxns.forEach(t => {
      lastDateMap.set(t._id.toString(), t.lastDate);
    });

    const now = new Date();
    const result = buyers.map(buyer => {
      const lastDate = lastDateMap.get(buyer._id.toString()) || buyer.createdAt;
      const diffDays = Math.floor((now - new Date(lastDate)) / (1000 * 60 * 60 * 24));

      let bucket = '0-7 DAYS';
      if (diffDays > 30) bucket = '30+ DAYS';
      else if (diffDays > 15) bucket = '16-30 DAYS';
      else if (diffDays > 7) bucket = '8-15 DAYS';

      return {
        id: buyer._id,
        name: buyer.name,
        phone: buyer.phone,
        code: buyer.buyerCode,
        balance: buyer.currentBalance,
        lastTransactionDate: lastDate,
        daysIdle: diffDays,
        bucket
      };
    });

    const summary = {
      under7Days: result.filter(r => r.bucket === '0-7 DAYS').reduce((s, r) => s + r.balance, 0),
      days8to15: result.filter(r => r.bucket === '8-15 DAYS').reduce((s, r) => s + r.balance, 0),
      days16to30: result.filter(r => r.bucket === '16-30 DAYS').reduce((s, r) => s + r.balance, 0),
      over30Days: result.filter(r => r.bucket === '30+ DAYS').reduce((s, r) => s + r.balance, 0),
      totalOutstanding: result.reduce((s, r) => s + r.balance, 0)
    };

    res.json({
      success: true,
      summary,
      buyers: result
    });
  } catch (error) {
    next(error);
  }
};

exports.backupDatabase = async (req, res, next) => {
  try {
    const backupData = {
      timestamp: new Date().toISOString(),
      business: 'தேவா & கோ',
      settings: await Settings.find(),
      buyers: await Buyer.find(),
      suppliers: await Supplier.find(),
      transactions: await Transaction.find(),
      supplierBills: await SupplierBill.find(),
      expenses: await Expense.find()
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=deva_co_backup_${Date.now()}.json`);
    res.json(backupData);
  } catch (error) {
    next(error);
  }
};
