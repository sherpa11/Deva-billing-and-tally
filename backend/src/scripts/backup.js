require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const Settings = require('../models/Settings');
const Buyer = require('../models/Buyer');
const Supplier = require('../models/Supplier');
const Transaction = require('../models/Transaction');
const SupplierBill = require('../models/SupplierBill');
const Expense = require('../models/Expense');
const User = require('../models/User');

const runBackup = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deva_co_billing');
    console.log('[Backup] Connected to database');

    const backupDir = path.join(__dirname, '../../backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup_deva_co_${timestamp}.json`;
    const filepath = path.join(backupDir, filename);

    const data = {
      timestamp: new Date().toISOString(),
      business: 'தேவா & கோ',
      settings: await Settings.find(),
      buyers: await Buyer.find(),
      suppliers: await Supplier.find(),
      transactions: await Transaction.find(),
      supplierBills: await SupplierBill.find(),
      expenses: await Expense.find(),
      users: await User.find().select('-password')
    };

    fs.writeFileSync(filepath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`[Backup] Successfully written backup file to: ${filepath}`);
    process.exit(0);
  } catch (err) {
    console.error('[Backup Error]:', err);
    process.exit(1);
  }
};

runBackup();
