const Buyer = require('../models/Buyer');
const Transaction = require('../models/Transaction');
const { getNextSequenceValue } = require('../models/Counter');

exports.getBuyers = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    let query = {};

    if (status === 'active') {
      query.isActive = true;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { buyerCode: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    // Fast path for autocomplete / search dropdowns
    if (req.query.autocomplete === 'true') {
      const limit = Math.min(Number(req.query.limit) || 40, 100);
      const buyers = await Buyer.find(query)
        .select('name phone buyerCode address currentBalance isActive')
        .sort({ name: 1 })
        .limit(limit)
        .lean();
      return res.json({
        success: true,
        count: buyers.length,
        buyers
      });
    }

    const buyers = await Buyer.find(query).sort({ name: 1 }).lean();

    // Fetch the latest transaction date for each buyer
    const lastActiveMap = {};
    if (buyers.length > 0) {
      const buyerIds = buyers.map(b => b._id);
      const lastTxns = await Transaction.aggregate([
        { $match: { buyerId: { $in: buyerIds }, isVoid: false } },
        { $sort: { transactionDate: -1, createdAt: -1 } },
        { $group: { _id: '$buyerId', lastActive: { $first: '$transactionDate' } } }
      ]);

      lastTxns.forEach(item => {
        lastActiveMap[item._id.toString()] = item.lastActive;
      });
    }

    const enrichedBuyers = buyers.map(b => ({
      ...b,
      lastActive: lastActiveMap[b._id.toString()] || b.updatedAt || b.createdAt || null
    }));

    res.json({
      success: true,
      count: enrichedBuyers.length,
      buyers: enrichedBuyers
    });
  } catch (error) {
    next(error);
  }
};

exports.getBuyerById = async (req, res, next) => {
  try {
    const [buyer, recentTransactions] = await Promise.all([
      Buyer.findById(req.params.id).lean(),
      Transaction.find({
        buyerId: req.params.id,
        isVoid: false
      })
        .sort({ transactionDate: -1, createdAt: -1 })
        .limit(20)
        .populate('buyerId', 'name phone address buyerCode')
        .populate('createdBy', 'name')
        .lean()
    ]);

    if (!buyer) {
      return res.status(404).json({ success: false, message: 'வாடிக்கையாளர் கிடைக்கவில்லை (Buyer not found)' });
    }

    res.json({
      success: true,
      buyer,
      recentTransactions
    });
  } catch (error) {
    next(error);
  }
};

exports.createBuyer = async (req, res, next) => {
  try {
    const { name, phone, address, initialBalance, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'வாடிக்கையாளர் பெயரை உள்ளிடவும் (Name required)' });
    }

    const seq = await getNextSequenceValue('buyerCode');
    const buyerCode = `B${String(seq).padStart(3, '0')}`;

    const balance = Number(initialBalance) || 0;

    const buyer = await Buyer.create({
      buyerCode,
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      currentBalance: balance,
      notes: notes ? notes.trim() : ''
    });

    // If initial balance provided, create an initial transaction ledger entry
    if (balance !== 0) {
      const txnSeq = await getNextSequenceValue('transactionSeq');
      await Transaction.create({
        transactionNumber: `TXN-${String(txnSeq).padStart(6, '0')}`,
        buyerId: buyer._id,
        type: 'PAYMENT',
        transactionDate: new Date(),
        oldBalance: 0,
        totalDue: balance,
        amountPaid: 0,
        newBalance: balance,
        notes: 'துவக்க இருப்பு (Opening Balance)',
        createdBy: req.user ? req.user._id : null
      });
    }

    res.status(201).json({
      success: true,
      message: 'வாடிக்கையாளர் வெற்றிகரமாக சேர்க்கப்பட்டார்',
      buyer
    });
  } catch (error) {
    next(error);
  }
};

exports.updateBuyer = async (req, res, next) => {
  try {
    const { name, phone, address, notes, isActive } = req.body;
    const buyer = await Buyer.findById(req.params.id);
    if (!buyer) {
      return res.status(404).json({ success: false, message: 'வாடிக்கையாளர் கிடைக்கவில்லை' });
    }

    if (name) buyer.name = name.trim();
    if (phone !== undefined) buyer.phone = phone.trim();
    if (address !== undefined) buyer.address = address.trim();
    if (notes !== undefined) buyer.notes = notes.trim();
    if (isActive !== undefined) buyer.isActive = isActive;

    await buyer.save();

    res.json({
      success: true,
      message: 'வாடிக்கையாளர் விவரங்கள் புதுப்பிக்கப்பட்டன',
      buyer
    });
  } catch (error) {
    next(error);
  }
};

exports.getBuyerLedger = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let filter = { buyerId: req.params.id, isVoid: false };
    if (startDate || endDate) {
      filter.transactionDate = {};
      if (startDate) {
        filter.transactionDate.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.transactionDate.$lte = end;
      }
    }

    const [buyer, transactions] = await Promise.all([
      Buyer.findById(req.params.id).lean(),
      Transaction.find(filter)
        .sort({ transactionDate: 1, createdAt: 1 })
        .populate('buyerId', 'name phone address buyerCode')
        .populate('createdBy', 'name')
        .lean()
    ]);

    if (!buyer) {
      return res.status(404).json({ success: false, message: 'வாடிக்கையாளர் கிடைக்கவில்லை' });
    }

    res.json({
      success: true,
      buyer,
      transactions
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteBuyer = async (req, res, next) => {
  try {
    const buyer = await Buyer.findById(req.params.id);
    if (!buyer) {
      return res.status(404).json({ success: false, message: 'வாடிக்கையாளர் கிடைக்கவில்லை (Buyer not found)' });
    }

    const { force } = req.query;
    const txnCount = await Transaction.countDocuments({ buyerId: buyer._id, isVoid: false });

    if (txnCount > 0 && force !== 'true' && buyer.currentBalance !== 0) {
      return res.status(400).json({
        success: false,
        message: `Buyer has ${txnCount} transactions and an active balance of ₹${buyer.currentBalance}. Confirm to force delete.`,
        requiresConfirmation: true,
        currentBalance: buyer.currentBalance,
        txnCount
      });
    }

    if (force === 'true') {
      await Transaction.deleteMany({ buyerId: buyer._id });
    }

    await Buyer.findByIdAndDelete(buyer._id);

    res.json({
      success: true,
      message: 'வாடிக்கையாளர் வெற்றிகரமாக நீக்கப்பட்டார் (Buyer deleted successfully)'
    });
  } catch (error) {
    next(error);
  }
};
