const mongoose = require('mongoose');

const supplierPaymentSchema = new mongoose.Schema({
  paymentNumber: {
    type: String,
    trim: true,
    index: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true,
    index: true
  },
  amountPaid: {
    type: Number,
    required: true,
    min: [0.01, 'Payment amount must be greater than zero']
  },
  paymentDate: {
    type: Date,
    required: true,
    index: true,
    default: Date.now
  },
  paymentMode: {
    type: String,
    enum: ['CASH', 'GPAY', 'BANK', 'CHEQUE'],
    default: 'CASH'
  },
  oldBalance: {
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

supplierPaymentSchema.index({ isVoid: 1, paymentDate: -1, createdAt: -1 });
supplierPaymentSchema.index({ supplierId: 1, isVoid: 1, paymentDate: -1, createdAt: -1 });
supplierPaymentSchema.index({ paymentDate: 1, isVoid: 1 });

module.exports = mongoose.model('SupplierPayment', supplierPaymentSchema);
