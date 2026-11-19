const SupplierBill = require('../models/SupplierBill');
const Supplier = require('../models/Supplier');
const { getNextSequenceValue } = require('../models/Counter');

exports.createSupplierBill = async (req, res, next) => {
  try {
    const {
      supplierId,
      transactionDate,
      items = [],
      deductions = {},
      notes = '',
      manualOldBalance,
      previousBalance,
      amountPaid = 0
    } = req.body;

    if (!supplierId) {
      return res.status(400).json({ success: false, message: 'விவசாயி / சப்ளையரை தேர்ந்தெடுக்கவும்' });
    }

    const supplier = await Supplier.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'விவசாயி / சப்ளையர் கிடைக்கவில்லை' });
    }

    // Process items
    let grossTotal = 0;
    const processedItems = items.map(item => {
      const rate = Number(item.rate) || 0;
      const quantity = Number(item.quantity) || 0;
      const bigBoxes = Number(item.bigBoxes) || 0;
      const smallBoxes = Number(item.smallBoxes) || 0;
      const bigEquivalent = Math.round((bigBoxes + (smallBoxes / 2) + Number.EPSILON) * 10) / 10;

      let amount = Number(item.amount);
      if (isNaN(amount) || amount <= 0) {
        if (bigEquivalent > 0) {
          amount = Math.round(bigEquivalent * rate);
        } else {
          amount = Math.round(quantity * rate);
        }
      }

      grossTotal += amount;

      return {
        rate,
        description: item.description || 'தக்காளி',
        quantity: quantity || bigBoxes || bigEquivalent,
        amount,
        bigBoxes,
        smallBoxes,
        bigEquivalent
      };
    });

    grossTotal = Math.round(grossTotal * 100) / 100;

    // Deductions
    const commission = deductions.commission !== undefined && deductions.commission !== null && deductions.commission !== ''
      ? Number(deductions.commission)
      : Math.round(grossTotal * 0.10);
    const gate = Number(deductions.gate) || 0;
    const coolie = Number(deductions.coolie) || 0;
    const rent = Number(deductions.rent) || 0;
    const debit = Number(deductions.debit) || 0;

    const mandiDeductions = Math.round((commission + gate + coolie + rent) * 100) / 100;
    const purchaseNetAmount = Math.round((grossTotal - mandiDeductions) * 100) / 100;

    // Automatically carry forward supplier outstanding balance unless explicitly overridden
    const prevBal = previousBalance !== undefined && previousBalance !== null && previousBalance !== ''
      ? Number(previousBalance)
      : (manualOldBalance !== undefined && manualOldBalance !== null && manualOldBalance !== ''
        ? Number(manualOldBalance)
        : Number(supplier.currentBalance || 0));

    // மொத்தம் (Total Payable to Supplier) = Current Purchase Net + Previous Outstanding
    const totalPayable = Math.round((purchaseNetAmount + prevBal) * 100) / 100;

    // செலுத்திய தொகை (Amount Paid)
    const paid = Number(amountPaid) || 0;

    // மீதி பாக்கி (Remaining Balance) = மொத்தம் - செலுத்திய தொகை
    const remainingBal = Math.round((totalPayable - paid) * 100) / 100;

    const billNumber = await getNextSequenceValue('supplierBillNumber');

    const bill = new SupplierBill({
      billNumber,
      supplierId: supplier._id,
      transactionDate: transactionDate ? new Date(transactionDate) : new Date(),
      items: processedItems,
      grossTotal,
      deductions: {
        commission,
        gate,
        coolie,
        rent,
        debit: prevBal
      },
      totalDeductions: mandiDeductions,
      purchaseNetAmount,
      previousBalance: prevBal,
      oldBalance: prevBal,
      totalPayable,
      netPayable: totalPayable,
      amountPaid: paid,
      remainingBalance: remainingBal,
      newBalance: remainingBal,
      notes: notes ? notes.trim() : '',
      createdBy: req.user ? req.user._id : null
    });

    await bill.save();

    // Update supplier ledger
    supplier.currentBalance = remainingBal;
    supplier.totalPurchases = Math.round(((supplier.totalPurchases || 0) + grossTotal) * 100) / 100;
    supplier.totalPayments = Math.round(((supplier.totalPayments || 0) + paid) * 100) / 100;
    await supplier.save();

    await bill.populate('supplierId', 'name phone address supplierCode');

    res.status(201).json({
      success: true,
      message: 'விவசாயி பில் வெற்றிகரமாக உருவாக்கப்பட்டது (Supplier bill generated)',
      bill
    });
  } catch (error) {
    next(error);
  }
};

exports.getSupplierBills = async (req, res, next) => {
  try {
    const { date, supplierId, page = 1, limit = 50 } = req.query;
    let filter = { isVoid: false };

    if (supplierId) {
      filter.supplierId = supplierId;
    }

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.transactionDate = { $gte: start, $lte: end };
    }

    const [bills, total] = await Promise.all([
      SupplierBill.find(filter)
        .sort({ transactionDate: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .populate('supplierId', 'name phone supplierCode')
        .populate('createdBy', 'name')
        .lean(),
      SupplierBill.countDocuments(filter)
    ]);

    res.json({
      success: true,
      count: bills.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      bills
    });
  } catch (error) {
    next(error);
  }
};

exports.getSupplierBillById = async (req, res, next) => {
  try {
    const bill = await SupplierBill.findById(req.params.id)
      .populate('supplierId', 'name phone address supplierCode')
      .populate('createdBy', 'name')
      .lean();
    if (!bill) {
      return res.status(404).json({ success: false, message: 'பில் கிடைக்கவில்லை' });
    }
    res.json({ success: true, bill });
  } catch (error) {
    next(error);
  }
};

exports.updateSupplierBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      transactionDate,
      items = [],
      deductions = {},
      notes = '',
      previousBalance,
      amountPaid = 0
    } = req.body;

    const bill = await SupplierBill.findById(id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'பில் கிடைக்கவில்லை' });
    }
    if (bill.isVoid) {
      return res.status(400).json({ success: false, message: 'ரத்து செய்யப்பட்ட பில்லை திருத்த முடியாது' });
    }

    const supplier = await Supplier.findById(bill.supplierId);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'விவசாயி கிடைக்கவில்லை' });
    }

    const oldGross = bill.grossTotal || 0;
    const oldPaid = Number(bill.amountPaid) || 0;
    const oldRemaining = bill.remainingBalance !== undefined ? bill.remainingBalance : (bill.newBalance || 0);

    let newGross = 0;
    const processedItems = items.map(item => {
      const rate = Number(item.rate) || 0;
      const quantity = Number(item.quantity) || 0;
      const bigBoxes = Number(item.bigBoxes) || 0;
      const smallBoxes = Number(item.smallBoxes) || 0;
      const bigEquivalent = Math.round((bigBoxes + (smallBoxes / 2) + Number.EPSILON) * 10) / 10;
      let amount = Number(item.amount);
      if (isNaN(amount) || amount <= 0) {
        amount = bigEquivalent > 0 ? Math.round(bigEquivalent * rate) : Math.round(quantity * rate);
      }
      newGross += amount;
      return {
        rate,
        description: item.description || 'தக்காளி',
        quantity: quantity || bigBoxes || bigEquivalent,
        amount,
        bigBoxes,
        smallBoxes,
        bigEquivalent
      };
    });

    const commission = deductions.commission !== undefined && deductions.commission !== null && deductions.commission !== ''
      ? Number(deductions.commission)
      : Math.round(newGross * 0.10);
    const gate = Number(deductions.gate) || 0;
    const coolie = Number(deductions.coolie) || 0;
    const rent = Number(deductions.rent) || 0;
    const debit = Number(deductions.debit) || 0;

    const mandiDeductions = Math.round((commission + gate + coolie + rent) * 100) / 100;
    const purchaseNetAmount = Math.round((newGross - mandiDeductions) * 100) / 100;

    const prevBal = previousBalance !== undefined && previousBalance !== null
      ? Number(previousBalance)
      : (bill.previousBalance !== undefined ? bill.previousBalance : (bill.oldBalance || 0));

    const totalPayable = Math.round((purchaseNetAmount + prevBal) * 100) / 100;
    const paid = Number(amountPaid) || 0;
    const remainingBal = Math.round((totalPayable - paid) * 100) / 100;

    bill.items = processedItems;
    bill.grossTotal = newGross;
    bill.deductions = { commission, gate, coolie, rent, debit: prevBal };
    bill.totalDeductions = mandiDeductions;
    bill.purchaseNetAmount = purchaseNetAmount;
    bill.previousBalance = prevBal;
    bill.oldBalance = prevBal;
    bill.totalPayable = totalPayable;
    bill.netPayable = totalPayable;
    bill.amountPaid = paid;
    bill.remainingBalance = remainingBal;
    bill.newBalance = remainingBal;
    if (notes !== undefined) bill.notes = notes.trim();
    if (transactionDate) bill.transactionDate = new Date(transactionDate);

    await bill.save();

    // Adjust supplier ledger by delta without duplicate or corrupted balances
    const balanceDelta = remainingBal - oldRemaining;
    supplier.currentBalance = Math.round((supplier.currentBalance + balanceDelta) * 100) / 100;
    supplier.totalPurchases = Math.max(0, Math.round(((supplier.totalPurchases || 0) - oldGross + newGross) * 100) / 100);
    supplier.totalPayments = Math.max(0, Math.round(((supplier.totalPayments || 0) - oldPaid + paid) * 100) / 100);
    await supplier.save();

    await bill.populate('supplierId', 'name phone address supplierCode');

    res.json({
      success: true,
      message: 'விவசாயி பில் வெற்றிகரமாக புதுப்பிக்கப்பட்டது (Supplier bill updated)',
      bill
    });
  } catch (error) {
    next(error);
  }
};

exports.voidSupplierBill = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const bill = await SupplierBill.findById(id);
    if (!bill) {
      return res.status(404).json({ success: false, message: 'பில் கிடைக்கவில்லை' });
    }

    if (bill.isVoid) {
      return res.status(400).json({ success: false, message: 'இந்த பில் ஏற்கனவே ரத்து செய்யப்பட்டுள்ளது' });
    }

    const supplier = await Supplier.findById(bill.supplierId);
    if (supplier) {
      // Revert balance: subtract current bill's net addition and add back payment
      const billPrevBal = bill.previousBalance !== undefined ? bill.previousBalance : (bill.oldBalance || 0);
      const billTotalPayable = bill.totalPayable !== undefined ? bill.totalPayable : (bill.netPayable || 0);
      const billPurchaseNet = bill.purchaseNetAmount !== undefined ? bill.purchaseNetAmount : (billTotalPayable - billPrevBal);
      const billPaid = Number(bill.amountPaid) || 0;

      supplier.currentBalance = Math.round((supplier.currentBalance - billPurchaseNet + billPaid) * 100) / 100;
      supplier.totalPurchases = Math.max(0, Math.round(((supplier.totalPurchases || 0) - bill.grossTotal) * 100) / 100);
      supplier.totalPayments = Math.max(0, Math.round(((supplier.totalPayments || 0) - billPaid) * 100) / 100);
      await supplier.save();
    }

    bill.isVoid = true;
    bill.voidReason = reason || 'நிர்வாகியால் ரத்து செய்யப்பட்டது';
    bill.voidedAt = new Date();
    bill.voidedBy = req.user ? req.user._id : null;
    await bill.save();

    res.json({
      success: true,
      message: 'விவசாயி பில் ரத்து செய்யப்பட்டது',
      bill
    });
  } catch (error) {
    next(error);
  }
};
