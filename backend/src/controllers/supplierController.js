const Supplier = require('../models/Supplier');
const SupplierBill = require('../models/SupplierBill');
const { getNextSequenceValue } = require('../models/Counter');

exports.getSuppliers = async (req, res, next) => {
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
        { supplierCode: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } }
      ];
    }

    const suppliers = await Supplier.find(query).sort({ name: 1 });
    res.json({
      success: true,
      count: suppliers.length,
      suppliers
    });
  } catch (error) {
    next(error);
  }
};

exports.getSupplierById = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'விவசாயி / சப்ளையர் கிடைக்கவில்லை' });
    }

    const recentBills = await SupplierBill.find({
      supplierId: supplier._id,
      isVoid: false
    })
      .sort({ transactionDate: -1, createdAt: -1 })
      .limit(20)
      .populate('createdBy', 'name');

    res.json({
      success: true,
      supplier,
      recentBills
    });
  } catch (error) {
    next(error);
  }
};

exports.createSupplier = async (req, res, next) => {
  try {
    const { name, phone, address, initialBalance, notes } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'விவசாயி / சப்ளையர் பெயரை உள்ளிடவும்' });
    }

    const seq = await getNextSequenceValue('supplierCode');
    const supplierCode = `S${String(seq).padStart(3, '0')}`;
    const balance = Number(initialBalance) || 0;

    const supplier = await Supplier.create({
      supplierCode,
      name: name.trim(),
      phone: phone ? phone.trim() : '',
      address: address ? address.trim() : '',
      currentBalance: balance,
      notes: notes ? notes.trim() : ''
    });

    res.status(201).json({
      success: true,
      message: 'விவசாயி / சப்ளையர் வெற்றிகரமாக சேர்க்கப்பட்டார்',
      supplier
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const { name, phone, address, notes, isActive } = req.body;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'விவசாயி / சப்ளையர் கிடைக்கவில்லை' });
    }

    if (name) supplier.name = name.trim();
    if (phone !== undefined) supplier.phone = phone.trim();
    if (address !== undefined) supplier.address = address.trim();
    if (notes !== undefined) supplier.notes = notes.trim();
    if (isActive !== undefined) supplier.isActive = isActive;

    await supplier.save();

    res.json({
      success: true,
      message: 'விவரங்கள் புதுப்பிக்கப்பட்டன',
      supplier
    });
  } catch (error) {
    next(error);
  }
};

exports.getSupplierPurchases = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'விவசாயி / சப்ளையர் கிடைக்கவில்லை' });
    }

    let filter = { supplierId: supplier._id, isVoid: false };
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

    const bills = await SupplierBill.find(filter)
      .sort({ transactionDate: -1, createdAt: -1 })
      .populate('createdBy', 'name');

    res.json({
      success: true,
      supplier,
      bills
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'விவசாயி / சப்ளையர் கிடைக்கவில்லை (Supplier not found)' });
    }

    // Check if supplier has any linked purchase bills
    const billCount = await SupplierBill.countDocuments({ supplierId: supplier._id });

    if (billCount > 0) {
      // Safe deactivation / archiving: preserve all transactions and historical records
      supplier.isActive = false;
      await supplier.save();

      return res.json({
        success: true,
        archived: true,
        message: `விவசாயி "${supplier.name}" மீது ${billCount} பில்கள் உள்ளன. வரலாற்று பரிவர்த்தனைகளைப் பாதுகாக்க இவர் பாதுகாப்பாக ஆவணப்படுத்தப்பட்டார் (Supplier archived to protect ${billCount} linked purchase bills).`,
        supplier
      });
    }

    // If no linked bills / transactions, permanently delete
    await Supplier.findByIdAndDelete(supplier._id);

    res.json({
      success: true,
      archived: false,
      message: `விவசாயி "${supplier.name}" வெற்றிகரமாக நீக்கப்பட்டார் (Supplier permanently deleted).`,
      supplier
    });
  } catch (error) {
    next(error);
  }
};

exports.restoreSupplier = async (req, res, next) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'விவசாயி / சப்ளையர் கிடைக்கவில்லை (Supplier not found)' });
    }

    supplier.isActive = true;
    await supplier.save();

    res.json({
      success: true,
      message: `விவசாயி "${supplier.name}" மீண்டும் செயல்படுத்தப்பட்டார் (Supplier restored successfully).`,
      supplier
    });
  } catch (error) {
    next(error);
  }
};
