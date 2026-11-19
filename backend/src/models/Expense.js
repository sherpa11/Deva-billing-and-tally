const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  purpose: {
    type: String,
    required: true,
    trim: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    default: 'GENERAL',
    enum: ['TEA_SNACKS', 'COOLIE', 'RENT', 'ELECTRICITY', 'TRANSPORT', 'GENERAL', 'OTHER']
  },
  notes: {
    type: String,
    trim: true
  },
  isVoid: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

expenseSchema.index({ isVoid: 1, date: -1, createdAt: -1 });
expenseSchema.index({ date: 1, isVoid: 1 });
expenseSchema.index({ category: 1, date: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
