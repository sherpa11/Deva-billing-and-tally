const Settings = require('../models/Settings');

let cachedSettings = null;
let cachedSettingsTime = 0;
const SETTINGS_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

exports.getSettings = async (req, res, next) => {
  try {
    if (cachedSettings && Date.now() - cachedSettingsTime < SETTINGS_CACHE_TTL_MS) {
      return res.json({ success: true, settings: cachedSettings });
    }

    let settings = await Settings.findOne().lean();
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
      if (settings && typeof settings.toObject === 'function') {
        settings = settings.toObject();
      }
    }

    cachedSettings = settings;
    cachedSettingsTime = Date.now();

    res.json({ success: true, settings });
  } catch (error) {
    next(error);
  }
};

exports.updateSettings = async (req, res, next) => {
  try {
    cachedSettings = null; // Invalidate cache immediately
    cachedSettingsTime = 0;

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
      phone1,
      phone2,
      footerNote,
      defaultCommissionRate,
      buyerBillFormat,
      supplierBillFormat
    } = req.body;

    if (storeName !== undefined && storeName !== '') settings.storeName = String(storeName).trim();
    if (tagline !== undefined) settings.tagline = String(tagline).trim();
    if (proprietor !== undefined && proprietor !== '') settings.proprietor = String(proprietor).trim();
    if (address !== undefined && address !== '') settings.address = String(address).trim();
    
    if (Array.isArray(phones)) {
      settings.phones = phones.map(p => String(p).trim()).filter(Boolean);
    } else if (phone1 !== undefined || phone2 !== undefined) {
      settings.phones = [phone1, phone2].filter(Boolean).map(p => String(p).trim());
    }

    if (footerNote !== undefined) settings.footerNote = String(footerNote).trim();
    if (defaultCommissionRate !== undefined && !isNaN(Number(defaultCommissionRate))) {
      settings.defaultCommissionRate = Number(defaultCommissionRate);
    }
    if (buyerBillFormat) settings.buyerBillFormat = buyerBillFormat;
    if (supplierBillFormat) settings.supplierBillFormat = supplierBillFormat;

    await settings.save();

    cachedSettings = settings.toObject();
    cachedSettingsTime = Date.now();

    res.json({
      success: true,
      message: 'நிறுவன அமைப்புகள் வெற்றிகரமாக சேமிக்கப்பட்டன (Settings updated successfully)',
      settings
    });
  } catch (error) {
    next(error);
  }
};
