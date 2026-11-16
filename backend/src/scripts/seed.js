require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Settings = require('../models/Settings');
const Buyer = require('../models/Buyer');
const Supplier = require('../models/Supplier');
const { Counter } = require('../models/Counter');

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deva_co_billing');
    console.log('[Seed] Connected to MongoDB database: deva_co_billing');

    // 1. Settings
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
      console.log('[Seed] Created default Settings for தேவா & கோ');
    }

    // 2. Admin User
    let admin = await User.findOne({ username: 'admin' });
    if (!admin) {
      admin = await User.create({
        username: 'admin',
        password: 'Admin@123',
        name: 'R. தேவதாஸ் (உரிமையாளர்)',
        role: 'ADMIN',
        phone: '94433 18359'
      });
      console.log('[Seed] Created Admin User: admin / Admin@123');
    }

    // 3. Accountant User
    let accountant = await User.findOne({ username: 'accountant' });
    if (!accountant) {
      accountant = await User.create({
        username: 'accountant',
        password: 'Deva@123',
        name: 'கணக்காளர் (Staff)',
        role: 'ACCOUNTANT',
        phone: '95853 56765'
      });
      console.log('[Seed] Created Accountant User: accountant / Deva@123');
    }

    // 4. Counters
    await Counter.findOneAndUpdate(
      { id: 'supplierBillNumber' },
      { $setOnInsert: { seq: 23 } }, // Next will be 24, matching the uploaded pad!
      { upsert: true }
    );
    await Counter.findOneAndUpdate(
      { id: 'buyerBillNumber' },
      { $setOnInsert: { seq: 0 } },
      { upsert: true }
    );
    await Counter.findOneAndUpdate(
      { id: 'transactionSeq' },
      { $setOnInsert: { seq: 100 } },
      { upsert: true }
    );
    await Counter.findOneAndUpdate(
      { id: 'buyerCode' },
      { $setOnInsert: { seq: 5 } },
      { upsert: true }
    );
    await Counter.findOneAndUpdate(
      { id: 'supplierCode' },
      { $setOnInsert: { seq: 5 } },
      { upsert: true }
    );

    // 5. Initial Buyers if none exist
    const buyerCount = await Buyer.countDocuments();
    if (buyerCount === 0) {
      await Buyer.create([
        {
          buyerCode: 'B001',
          name: 'கண்ணன் வெஜிடபிள்ஸ்',
          phone: '98421 11223',
          address: 'கடை எண் 12, காந்தி மார்க்கெட்',
          currentBalance: 4500,
          totalPurchases: 18500,
          totalPayments: 14000
        },
        {
          buyerCode: 'B002',
          name: 'எஸ்.கே. டிரேடர்ஸ்',
          phone: '94431 55667',
          address: 'பழனி ரோடு, திண்டுக்கல்',
          currentBalance: 0,
          totalPurchases: 12000,
          totalPayments: 12000
        },
        {
          buyerCode: 'B003',
          name: 'முத்து தக்காளி ஸ்டோர்',
          phone: '97880 99881',
          address: 'பஜார் தெரு, ஒட்டன்சத்திரம்',
          currentBalance: 8200,
          totalPurchases: 25000,
          totalPayments: 16800
        },
        {
          buyerCode: 'B004',
          name: 'ராஜா பிரதர்ஸ்',
          phone: '99442 33445',
          address: 'மெயின் பஜார், நத்தம்',
          currentBalance: -500, // advance
          totalPurchases: 8000,
          totalPayments: 8500
        }
      ]);
      console.log('[Seed] Created sample buyers');
    }

    // 6. Initial Suppliers if none exist
    const supplierCount = await Supplier.countDocuments();
    if (supplierCount === 0) {
      await Supplier.create([
        {
          supplierCode: 'S001',
          name: 'மாரிமுத்து (விவசாயி)',
          phone: '96552 44112',
          address: 'செங்குறிச்சி கிராமம், திண்டுக்கல்',
          currentBalance: 12500,
          totalPurchases: 45000,
          totalPayments: 32500
        },
        {
          supplierCode: 'S002',
          name: 'ராமசாமி தோட்டம்',
          phone: '98654 33221',
          address: 'அய்யலூர், திண்டுக்கல்',
          currentBalance: 8000,
          totalPurchases: 32000,
          totalPayments: 24000
        },
        {
          supplierCode: 'S003',
          name: 'முருகன் ஃபார்ம்ஸ்',
          phone: '94422 77889',
          address: 'ரெட்டியார்சத்திரம்',
          currentBalance: 0,
          totalPurchases: 18000,
          totalPayments: 18000
        }
      ]);
      console.log('[Seed] Created sample suppliers');
    }

    console.log('[Seed] Database initialization completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('[Seed Error]:', err);
    process.exit(1);
  }
};

seedDB();
