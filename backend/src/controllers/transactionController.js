const Transaction = require('../models/Transaction');
const Buyer = require('../models/Buyer');
const { getNextSequenceValue } = require('../models/Counter');

exports.createSale = async (req, res, next) => {
  try {
    const {
      buyerId,
      transactionDate,
      bigBoxes = 0,
      smallBoxes = 0,
      ratePerBigBox = 0,
      amountPaid = 0,
      notes = '',
      manualOldBalance,
      items = []
    } = req.body;

    if (!buyerId) {
      return res.status(400).json({ success: false, message: 'வாடிக்கையாளரை தேர்ந்தெடுக்கவும் (Buyer required)' });
    }

    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ success: false, message: 'வாடிக்கையாளர் கிடைக்கவில்லை' });
    }

    // Mathematical calculations (supporting single or multi-row items)
    let processedItems = [];
    let numBig = 0;
    let numSmall = 0;
    let bigEquivalent = 0;
    let numRate = 0;
    let billAmount = 0;

    if (Array.isArray(items) && items.length > 0) {
      processedItems = items.map((it) => {
        const b = Number(it.bigBoxes) || 0;
        const s = Number(it.smallBoxes) || 0;
        const eq = Math.round((b + (s / 2) + Number.EPSILON) * 10) / 10;
        const r = Number(it.ratePerBigBox) || 0;
        const amt = Math.round(eq * r);
        return {
          bigBoxes: b,
          smallBoxes: s,
          bigEquivalent: eq,
          ratePerBigBox: r,
          amount: amt,
          description: it.description || ''
        };
      });

      numBig = processedItems.reduce((acc, it) => acc + it.bigBoxes, 0);
      numSmall = processedItems.reduce((acc, it) => acc + it.smallBoxes, 0);
      bigEquivalent = Math.round((numBig + (numSmall / 2) + Number.EPSILON) * 10) / 10;
      billAmount = processedItems.reduce((acc, it) => acc + it.amount, 0);
      numRate = processedItems.length > 0 ? processedItems[0].ratePerBigBox : 0;
    } else {
      numBig = Number(bigBoxes) || 0;
      numSmall = Number(smallBoxes) || 0;
      numRate = Number(ratePerBigBox) || 0;
      bigEquivalent = Math.round((numBig + (numSmall / 2) + Number.EPSILON) * 10) / 10;
      billAmount = Math.round(bigEquivalent * numRate);
      processedItems = [{
        bigBoxes: numBig,
        smallBoxes: numSmall,
        bigEquivalent,
        ratePerBigBox: numRate,
        amount: billAmount,
        description: ''
      }];
    }

    const numPaid = Number(amountPaid) || 0;
    const oldBal = manualOldBalance !== undefined && manualOldBalance !== null && manualOldBalance !== ''
      ? Number(manualOldBalance)
      : Number(buyer.currentBalance || 0);

    const totalDue = Math.round((billAmount + oldBal) * 100) / 100;
    const newBal = Math.round((totalDue - numPaid) * 100) / 100;

    // Sequential Bill Number & Transaction Sequence in parallel
    const [billNumber, txnSeq] = await Promise.all([
      getNextSequenceValue('buyerBillNumber'),
      getNextSequenceValue('transactionSeq')
    ]);
    const transactionNumber = `TXN-${String(txnSeq).padStart(6, '0')}`;

    const transaction = new Transaction({
      transactionNumber,
      billNumber,
      buyerId: buyer._id,
      type: 'SALE',
      transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      bigBoxes: numBig,
      smallBoxes: numSmall,
      bigEquivalent,
      ratePerBigBox: numRate,
      billAmount,
      items: processedItems,
      oldBalance: oldBal,
      totalDue,
      amountPaid: numPaid,
      newBalance: newBal,
      paymentMode: 'CASH',
      notes: notes ? notes.trim() : '',
      createdBy: req.user ? req.user._id : null
    });

    await transaction.save();

    // Update buyer balance
    buyer.currentBalance = newBal;
    buyer.totalPurchases = Math.round(((buyer.totalPurchases || 0) + billAmount) * 100) / 100;
    buyer.totalPayments = Math.round(((buyer.totalPayments || 0) + numPaid) * 100) / 100;
    await buyer.save();

    await transaction.populate('buyerId', 'name phone address buyerCode');

    res.status(201).json({
      success: true,
      message: 'பில் வெற்றிகரமாக உருவாக்கப்பட்டது (Bill generated successfully)',
      bill: transaction
    });
  } catch (error) {
    next(error);
  }
};

exports.createPayment = async (req, res, next) => {
  try {
    const {
      buyerId,
      amountPaid,
      paymentMode = 'CASH',
      transactionDate,
      notes = '',
      manualOldBalance
    } = req.body;

    if (!buyerId) {
      return res.status(400).json({ success: false, message: 'வாடிக்கையாளரை தேர்ந்தெடுக்கவும்' });
    }

    const numPaid = Number(amountPaid);
    if (isNaN(numPaid) || numPaid <= 0) {
      return res.status(400).json({ success: false, message: 'செல்லுபடியான தொகையை உள்ளிடவும் (Valid amount required)' });
    }

    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return res.status(404).json({ success: false, message: 'வாடிக்கையாளர் கிடைக்கவில்லை' });
    }

    const oldBal = manualOldBalance !== undefined && manualOldBalance !== null && manualOldBalance !== ''
      ? Number(manualOldBalance)
      : Number(buyer.currentBalance || 0);

    const newBal = Math.round((oldBal - numPaid) * 100) / 100;

    const txnSeq = await getNextSequenceValue('transactionSeq');
    const transactionNumber = `TXN-${String(txnSeq).padStart(6, '0')}`;

    const transaction = new Transaction({
      transactionNumber,
      buyerId: buyer._id,
      type: 'PAYMENT',
      transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      oldBalance: oldBal,
      totalDue: oldBal,
      amountPaid: numPaid,
      newBalance: newBal,
      paymentMode,
      notes: notes ? notes.trim() : 'ரொக்க வரவு (Payment Received)',
      createdBy: req.user ? req.user._id : null
    });

    await transaction.save();

    // Update buyer balance
    buyer.currentBalance = newBal;
    buyer.totalPayments = Math.round(((buyer.totalPayments || 0) + numPaid) * 100) / 100;
    await buyer.save();

    await transaction.populate('buyerId', 'name phone address buyerCode');

    res.status(201).json({
      success: true,
      message: 'வரவு வெற்றிகரமாக பதிவு செய்யப்பட்டது (Payment recorded successfully)',
      payment: transaction
    });
  } catch (error) {
    next(error);
  }
};

exports.voidTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'பரிவர்த்தனை கிடைக்கவில்லை' });
    }

    if (transaction.isVoid) {
      return res.status(400).json({ success: false, message: 'இந்த பரிவர்த்தனை ஏற்கனவே ரத்து செய்யப்பட்டுள்ளது' });
    }

    const buyer = await Buyer.findById(transaction.buyerId);
    if (buyer) {
      if (transaction.type === 'SALE') {
        // Reverse sale: subtract billAmount, re-add amountPaid
        buyer.currentBalance = Math.round((buyer.currentBalance - transaction.billAmount + transaction.amountPaid) * 100) / 100;
        buyer.totalPurchases = Math.max(0, Math.round(((buyer.totalPurchases || 0) - transaction.billAmount) * 100) / 100);
        buyer.totalPayments = Math.max(0, Math.round(((buyer.totalPayments || 0) - transaction.amountPaid) * 100) / 100);
      } else if (transaction.type === 'PAYMENT') {
        // Reverse payment: re-add amountPaid to currentBalance
        buyer.currentBalance = Math.round((buyer.currentBalance + transaction.amountPaid) * 100) / 100;
        buyer.totalPayments = Math.max(0, Math.round(((buyer.totalPayments || 0) - transaction.amountPaid) * 100) / 100);
      }
      await buyer.save();
    }

    transaction.isVoid = true;
    transaction.voidReason = reason || 'நிர்வாகியால் ரத்து செய்யப்பட்டது (Voided by Admin)';
    transaction.voidedAt = new Date();
    transaction.voidedBy = req.user ? req.user._id : null;
    await transaction.save();

    res.json({
      success: true,
      message: 'பரிவர்த்தனை வெற்றிகரமாக ரத்து செய்யப்பட்டது (Transaction voided)',
      transaction
    });
  } catch (error) {
    next(error);
  }
};

exports.getTransactions = async (req, res, next) => {
  try {
    const { date, type, buyerId, page = 1, limit = 50 } = req.query;
    let filter = { isVoid: false };

    if (type) {
      filter.type = type;
    }

    if (buyerId) {
      filter.buyerId = buyerId;
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.transactionDate = { $gte: start, $lte: end };
    }

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ transactionDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('buyerId', 'name phone buyerCode')
        .populate('createdBy', 'name')
        .lean(),
      Transaction.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: transactions.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      transactions
    });
  } catch (error) {
    next(error);
  }
};
