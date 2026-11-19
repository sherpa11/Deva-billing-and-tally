const mongoose = require('mongoose');

const buyerSchema = new mongoose.Schema({
  buyerCode: {
    type: String,
    trim: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    type: String,
    trim: true
  },
  currentBalance: {
    type: Number,
    default: 0
  },
  totalPurchases: {
    type: Number,
    default: 0
  },
  totalPayments: {
    type: Number,
    default: 0
  },
  notes: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true
});

buyerSchema.index({ isActive: 1, name: 1 });
buyerSchema.index({ isActive: 1, currentBalance: -1 });
buyerSchema.index({ name: 1, phone: 1, isActive: 1 });
buyerSchema.index({ phone: 1 });

module.exports = mongoose.model('Buyer', buyerSchema);
