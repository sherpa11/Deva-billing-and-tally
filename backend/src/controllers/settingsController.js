const Settings = require('../models/Settings');

exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({
        storeName: 'தேவா & கோ',
        tagline: 'தக்காளி & காய்கனி கமிஷன் மண்டி',
        proprietor: 'R. தேவதாஸ்',
        address: '54 A, அண்ணல் காந்தி மார்க்கெட், திண்டுக்கல் – 624 001',
        phones: ['94433 18359', '95853 56765'],
        footerNote: 'தாங்கள் வருகை நல்வரவு !',
        defaultCommissionRate: 10,
        buyerBillFormat: 'square',
        supplierBillFormat: 'pad'
      });
    }
    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }

    const {
      storeName,
      tagline,
      proprietor,
      address,
      phones,
      footerNote,
      defaultCommissionRate,
      buyerBillFormat,
      supplierBillFormat
    } = req.body;

    if (storeName) settings.storeName = storeName;
    if (tagline !== undefined) settings.tagline = tagline;
    if (proprietor) settings.proprietor = proprietor;
    if (address) settings.address = address;
    if (phones && Array.isArray(phones)) settings.phones = phones;
    if (footerNote !== undefined) settings.footerNote = footerNote;
    if (defaultCommissionRate !== undefined) settings.defaultCommissionRate = Number(defaultCommissionRate);
    if (buyerBillFormat) settings.buyerBillFormat = buyerBillFormat;
    if (supplierBillFormat) settings.supplierBillFormat = supplierBillFormat;

    await settings.save();

    res.json({
      success: true,
      message: 'நிறுவன அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன (Settings updated successfully)',
      settings
    });
  } catch (error) {
    next(error);
  }
};
