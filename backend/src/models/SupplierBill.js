const mongoose = require('mongoose');

const supplierItemSchema = new mongoose.Schema({
  rate: {
    type: Number,
    required: true,
    default: 0
  },
  description: {
    type: String,
    required: true,
    trim: true,
    default: 'தக்காளி'
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  amount: {
    type: Number,
    required: true,
    default: 0
  },
  bigBoxes: {
    type: Number,
    default: 0
  },
  smallBoxes: {
    type: Number,
    default: 0
  },
  bigEquivalent: {
    type: Number,
    default: 0
  }
}, { _id: false });

const supplierBillSchema = new mongoose.Schema({
  billNumber: {
    type: Number,
    required: true,
    index: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
    index: true
  },
  transactionDate: {
    type: Date,
    required: true,
    index: true,
    default: Date.now
  },
  items: {
    type: [supplierItemSchema],
    default: []
  },
  grossTotal: {
    type: Number,
    required: true,
    default: 0
  },
  deductions: {
    commission: { type: Number, default: 0 },
    gate: { type: Number, default: 0 },
    coolie: { type: Number, default: 0 },
    rent: { type: Number, default: 0 },
    debit: { type: Number, default: 0 }
  },
  totalDeductions: {
    type: Number,
    default: 0
  },
  purchaseNetAmount: {
    type: Number,
    default: 0
  },
  previousBalance: {
    type: Number,
    default: 0
  },
  oldBalance: {
    type: Number,
    default: 0
  },
  totalPayable: {
    type: Number,
    default: 0
  },
  netPayable: {
    type: Number,
    required: true,
    default: 0
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  remainingBalance: {
    type: Number,
    default: 0
  },
  newBalance: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  isVoid: {
    type: Boolean,
    default: false,
    index: true
  },
  voidReason: {
    type: String,
    trim: true
  },
  voidedAt: {
    type: Date
  },
  voidedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

supplierBillSchema.index({ supplierId: 1, isVoid: 1, transactionDate: -1 });
supplierBillSchema.index({ transactionDate: 1, isVoid: 1 });

module.exports = mongoose.model('SupplierBill', supplierBillSchema);
