const mongoose = require('mongoose');

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deva_co_billing';
  console.log('Connecting to database for reset:', uri);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log('\n--- EXECUTING BUSINESS DATA CLEANUP ---');

  // 1. Delete business records
  const delBuyers = await db.collection('buyers').deleteMany({});
  console.log(`Deleted buyers: ${delBuyers.deletedCount}`);

  const delSuppliers = await db.collection('suppliers').deleteMany({});
  console.log(`Deleted suppliers: ${delSuppliers.deletedCount}`);

  const delTxns = await db.collection('transactions').deleteMany({});
  console.log(`Deleted transactions: ${delTxns.deletedCount}`);

  const delBills = await db.collection('supplierbills').deleteMany({});
  console.log(`Deleted supplier bills: ${delBills.deletedCount}`);

  const delExpenses = await db.collection('expenses').deleteMany({});
  console.log(`Deleted expenses: ${delExpenses.deletedCount}`);

  // 2. Reset counters to start clean from 0 / 1
  const delCounters = await db.collection('counters').deleteMany({});
  console.log(`Reset sequence counters: ${delCounters.deletedCount}`);

  // 3. Verify preserved collections
  const userCount = await db.collection('users').countDocuments();
  const settingsCount = await db.collection('settings').countDocuments();
  console.log(`Preserved Users count: ${userCount}`);
  console.log(`Preserved Settings count: ${settingsCount}`);

  console.log('\n--- POST-RESET VERIFICATION ---');
  const collections = ['buyers', 'suppliers', 'transactions', 'supplierbills', 'expenses', 'counters'];
  for (const c of collections) {
    const count = await db.collection(c).countDocuments();
    console.log(` * ${c} count: ${count}`);
    if (count !== 0) {
      throw new Error(`Collection ${c} was not completely emptied! Remaining: ${count}`);
    }
  }

  console.log('\n>>> BUSINESS DATA RESET COMPLETED SUCCESSFULLY! <<<');
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Reset failed:', err);
  process.exit(1);
});
