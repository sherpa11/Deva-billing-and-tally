const Transaction = require('../models/Transaction');
const SupplierBill = require('../models/SupplierBill');
const Buyer = require('../models/Buyer');
const Supplier = require('../models/Supplier');
const Expense = require('../models/Expense');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    // Execute all independent database queries in a single concurrent Promise.all batch
    const [
      transactions,
      supplierBills,
      expenses,
      buyerAgg,
      supplierAgg,
      recentSales,
      recentPurchases
    ] = await Promise.all([
      // 1. Sales & Payments on target date
      Transaction.find({
        transactionDate: { $gte: startOfDay, $lte: endOfDay },
        isVoid: false
      })
        .select('type billAmount bigBoxes smallBoxes bigEquivalent amountPaid buyerId transactionDate createdAt billNumber newBalance')
        .populate('buyerId', 'name phone buyerCode')
        .lean(),

      // 2. Inward Purchases from Supplier Bills on target date
      SupplierBill.find({
        transactionDate: { $gte: startOfDay, $lte: endOfDay },
        isVoid: false
      })
        .populate('supplierId', 'name phone supplierCode')
        .lean(),

      // 3. Daily Expenses
      Expense.find({
        date: { $gte: startOfDay, $lte: endOfDay },
        isVoid: false
      }).select('amount').lean(),

      // 4. Buyer Outstanding aggregation
      Buyer.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalDue: { $sum: { $cond: [{ $gt: ['$currentBalance', 0] }, '$currentBalance', 0] } },
            totalAdv: { $sum: { $cond: [{ $lt: ['$currentBalance', 0] }, { $abs: '$currentBalance' }, 0] } }
          }
        }
      ]),

      // 5. Supplier Payable aggregation
      Supplier.aggregate([
        { $match: { isActive: true } },
        {
          $group: {
            _id: null,
            totalPayable: { $sum: { $cond: [{ $gt: ['$currentBalance', 0] }, '$currentBalance', 0] } }
          }
        }
      ]),

      // 6. Recent Activity Sales
      Transaction.find({ isVoid: false })
        .sort({ transactionDate: -1, createdAt: -1 })
        .limit(10)
        .populate('buyerId', 'name phone buyerCode')
        .populate('createdBy', 'name')
        .lean(),

      // 7. Recent Activity Purchases
      SupplierBill.find({ isVoid: false })
        .sort({ transactionDate: -1, createdAt: -1 })
        .limit(5)
        .populate('supplierId', 'name phone supplierCode')
        .populate('createdBy', 'name')
        .lean()
    ]);

    let dailySalesValue = 0;
    let dailyBigBoxesSold = 0;
    let dailySmallBoxesSold = 0;
    let dailyBigEqvSold = 0;
    let dailyCollections = 0;

    transactions.forEach(t => {
      if (t.type === 'SALE') {
        dailySalesValue += t.billAmount || 0;
        dailyBigBoxesSold += t.bigBoxes || 0;
        dailySmallBoxesSold += t.smallBoxes || 0;
        dailyBigEqvSold += t.bigEquivalent || 0;
        dailyCollections += t.amountPaid || 0;
      } else if (t.type === 'PAYMENT') {
        dailyCollections += t.amountPaid || 0;
      }
    });

    let dailyPurchaseValue = 0;
    let dailyNetPayable = 0;
    let dailyBigBoxesInward = 0;
    let dailySmallBoxesInward = 0;
    let dailyBigEqvInward = 0;

    supplierBills.forEach(sb => {
      dailyPurchaseValue += sb.grossTotal || 0;
      dailyNetPayable += sb.netPayable || 0;
      if (sb.items && sb.items.length > 0) {
        sb.items.forEach(it => {
          dailyBigBoxesInward += it.bigBoxes || 0;
          dailySmallBoxesInward += it.smallBoxes || 0;
          dailyBigEqvInward += it.bigEquivalent || (it.quantity || 0);
        });
      }
    });

    const dailyExpenseTotal = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalBuyerOutstanding = buyerAgg[0]?.totalDue || 0;
    const totalBuyerAdvance = buyerAgg[0]?.totalAdv || 0;
    const totalSupplierPayable = supplierAgg[0]?.totalPayable || 0;

    res.json({
      success: true,
      date: startOfDay.toISOString().split('T')[0],
      stats: {
        intake: {
          bigBoxes: dailyBigBoxesInward,
          smallBoxes: dailySmallBoxesInward,
          bigEquivalent: Math.round(dailyBigEqvInward * 10) / 10,
          grossValue: Math.round(dailyPurchaseValue * 100) / 100,
          netPayable: Math.round(dailyNetPayable * 100) / 100
        },
        sales: {
          bigBoxes: dailyBigBoxesSold,
          smallBoxes: dailySmallBoxesSold,
          bigEquivalent: Math.round(dailyBigEqvSold * 10) / 10,
          totalSales: Math.round(dailySalesValue * 100) / 100
        },
        collections: Math.round(dailyCollections * 100) / 100,
        expenses: Math.round(dailyExpenseTotal * 100) / 100,
        netCashFlow: Math.round((dailyCollections - dailyExpenseTotal) * 100) / 100,
        outstanding: {
          totalBuyerOutstanding: Math.round(totalBuyerOutstanding * 100) / 100,
          totalBuyerAdvance: Math.round(totalBuyerAdvance * 100) / 100,
          totalSupplierPayable: Math.round(totalSupplierPayable * 100) / 100
        }
      },
      recentTransactions: recentSales,
      recentPurchases,
      todaySupplierBills: supplierBills
    });
  } catch (error) {
    next(error);
  }
};
