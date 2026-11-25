const SupplierPayment = require('../models/SupplierPayment');
const Supplier = require('../models/Supplier');
const { getNextSequenceValue } = require('../models/Counter');
const { parseTransactionDate } = require('../utils/dateUtils');

exports.createSupplierPayment = async (req, res, next) => {
  try {
    const {
      supplierId,
      amountPaid,
      paymentMode = 'CASH',
      paymentDate,
      transactionDate,
      manualOldBalance,
      notes = ''
    } = req.body;

    if (!supplierId) {
      return res.status(400).json({
        success: false,
        message: 'விவசாயி / சப்ளையரை தேர்ந்தெடுக்கவும் (Supplier is required)'
      });
    }

    const amount = Number(amountPaid);
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'செல்லுபடியாகும் தொகையை உள்ளிடவும் (Enter a valid positive payment amount)'
      });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'விவசாயி / சப்ளையர் கிடைக்கவில்லை (Supplier not found)'
      });
    }

    const oldBal = manualOldBalance !== undefined && manualOldBalance !== null && manualOldBalance !== ''
      ? Number(manualOldBalance)
      : Number(supplier.currentBalance || 0);

    // Outstanding balance owed to supplier decreases by payment amount
    const newBal = Math.round((oldBal - amount) * 100) / 100;

    const seq = await getNextSequenceValue('supplierPaymentSeq');
    const paymentNumber = `SPAY-${String(seq).padStart(6, '0')}`;

    const dateVal = parseTransactionDate(paymentDate || transactionDate);

    const payment = new SupplierPayment({
      paymentNumber,
      supplierId: supplier._id,
      amountPaid: amount,
      paymentDate: dateVal,
      paymentMode: paymentMode || 'CASH',
      oldBalance: oldBal,
      newBalance: newBal,
      notes: notes ? notes.trim() : '',
      createdBy: req.user ? req.user._id : null
    });

    await payment.save();

    // Atomically update supplier balance and total payments
    supplier.currentBalance = newBal;
    supplier.totalPayments = Math.round(((supplier.totalPayments || 0) + amount) * 100) / 100;
    await supplier.save();

    await payment.populate('supplierId', 'name phone address supplierCode');

    res.status(201).json({
      success: true,
      message: 'விவசாயி பட்டுவாடா வெற்றிகரமாக பதிவு செய்யப்பட்டது (Supplier payment recorded successfully)',
      payment,
      supplier: {
        _id: supplier._id,
        name: supplier.name,
        currentBalance: supplier.currentBalance,
        totalPurchases: supplier.totalPurchases,
        totalPayments: supplier.totalPayments
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getSupplierPayments = async (req, res, next) => {
  try {
    const { supplierId, startDate, endDate, page = 1, limit = 50 } = req.query;
    let filter = { isVoid: false };

    if (supplierId) {
      filter.supplierId = supplierId;
    }

    if (startDate || endDate) {
      filter.paymentDate = {};
      if (startDate) {
        filter.paymentDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.paymentDate.$lte = end;
      }
    }

    const [payments, total] = await Promise.all([
      SupplierPayment.find(filter)
        .sort({ paymentDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('supplierId', 'name phone address supplierCode')
        .populate('createdBy', 'name')
        .lean(),
      SupplierPayment.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: payments.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      payments
    });
  } catch (error) {
    next(error);
  }
};

exports.voidSupplierPayment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason = 'Voided by Administrator' } = req.body;

    const payment = await SupplierPayment.findById(id);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'பட்டுவாடா பதிவு கிடைக்கவில்லை (Payment record not found)'
      });
    }

    if (payment.isVoid) {
      return res.status(400).json({
        success: false,
        message: 'இந்த பதிவு ஏற்கனவே ரத்து செய்யப்பட்டுள்ளது (Payment already voided)'
      });
    }

    payment.isVoid = true;
    payment.voidReason = reason;
    payment.voidedAt = new Date();
    payment.voidedBy = req.user ? req.user._id : null;
    await payment.save();

    // Revert balance on supplier
    const supplier = await Supplier.findById(payment.supplierId);
    if (supplier) {
      supplier.currentBalance = Math.round(((supplier.currentBalance || 0) + payment.amountPaid) * 100) / 100;
      supplier.totalPayments = Math.round(Math.max(0, (supplier.totalPayments || 0) - payment.amountPaid) * 100) / 100;
      await supplier.save();
    }

    res.json({
      success: true,
      message: 'பட்டுவாடா வெற்றிகரமாக ரத்து செய்யப்பட்டது (Supplier payment voided successfully)',
      payment
    });
  } catch (error) {
    next(error);
  }
};
