const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  storeName: {
    type: String,
    required: true,
    default: 'தேவா & கோ'
  },
  tagline: {
    type: String,
    default: 'தக்காளி & காய்கனி கமிஷன் மண்டி'
  },
  proprietor: {
    type: String,
    default: 'R. தேவதாஸ்'
  },
  address: {
    type: String,
    default: '54 A, அண்ணல் காந்தி மார்க்கெட், திண்டுக்கல் – 624 001'
  },
  phones: {
    type: [String],
    default: ['94433 18359', '95853 56765']
  },
  footerNote: {
    type: String,
    default: 'தாங்கள் வருகை நல்வரவு !'
  },
  defaultCommissionRate: {
    type: Number,
    default: 10
  },
  buyerBillFormat: {
    type: String,
    enum: ['square', 'a6', 'thermal'],
    default: 'square'
  },
  supplierBillFormat: {
    type: String,
    enum: ['pad', 'voucher'],
    default: 'pad'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
