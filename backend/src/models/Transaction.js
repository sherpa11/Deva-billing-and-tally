const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionNumber: {
    type: String,
    required: true,
    unique: true
  },
  billNumber: {
    type: Number,
    index: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Buyer',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['SALE', 'PAYMENT'],
    required: true,
    index: true
  },
  transactionDate: {
    type: Date,
    required: true,
    index: true,
    default: Date.now
  },
  // In case of SALE
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
  },
  ratePerBigBox: {
    type: Number,
    default: 0
  },
  billAmount: {
    type: Number,
    default: 0
  },
  // Multi-row line items
  items: [{
    bigBoxes: { type: Number, default: 0 },
    smallBoxes: { type: Number, default: 0 },
    bigEquivalent: { type: Number, default: 0 },
    ratePerBigBox: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    description: { type: String, default: '' }
  }],
  oldBalance: {
    type: Number,
    required: true,
    default: 0
  },
  totalDue: {
    type: Number,
    required: true,
    default: 0
  },
  amountPaid: {
    type: Number,
    required: true,
    default: 0
  },
  newBalance: {
    type: Number,
    required: true,
    default: 0
  },
  paymentMode: {
    type: String,
    enum: ['CASH', 'GPAY', 'BANK'],
    default: 'CASH'
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

transactionSchema.index({ isVoid: 1, transactionDate: -1, createdAt: -1 });
transactionSchema.index({ buyerId: 1, isVoid: 1, transactionDate: -1, createdAt: -1 });
transactionSchema.index({ isVoid: 1, type: 1, transactionDate: -1 });
transactionSchema.index({ transactionDate: 1, isVoid: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
