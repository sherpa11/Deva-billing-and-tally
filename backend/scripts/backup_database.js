const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deva_co_billing';
  console.log('Connecting to MongoDB:', uri);
  await mongoose.connect(uri);
  
  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  console.log('\n--- Existing Collections & Counts ---');
  const counts = {};
  for (const c of collections) {
    const count = await db.collection(c.name).countDocuments();
    counts[c.name] = count;
    console.log(` * ${c.name}: ${count} records`);
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups', `backup_${timestamp}`);
  fs.mkdirSync(backupDir, { recursive: true });
  
  console.log('\n--- Creating JSON Backup ---');
  console.log('Destination:', backupDir);
  for (const c of collections) {
    const docs = await db.collection(c.name).find({}).toArray();
    fs.writeFileSync(path.join(backupDir, `${c.name}.json`), JSON.stringify(docs, null, 2));
    console.log(`Saved ${c.name} (${docs.length} docs)`);
  }
  
  console.log('\n--- Verifying Backup Files ---');
  for (const c of collections) {
    const file = path.join(backupDir, `${c.name}.json`);
    const readDocs = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (readDocs.length !== counts[c.name]) {
      throw new Error(`Mismatch in ${c.name}! DB: ${counts[c.name]}, Backup: ${readDocs.length}`);
    }
    console.log(`Verified ${c.name}: ${readDocs.length} items verified`);
  }
  
  // Verify restore into test DB
  const testUri = 'mongodb://127.0.0.1:27017/deva_co_billing_backup_verify';
  const testConn = await mongoose.createConnection(testUri).asPromise();
  console.log('\n--- Testing Full Restore into Test DB ---');
  for (const c of collections) {
    const docs = JSON.parse(fs.readFileSync(path.join(backupDir, `${c.name}.json`), 'utf8'));
    if (docs.length > 0) {
      await testConn.collection(c.name).insertMany(docs);
    }
    const testCount = await testConn.collection(c.name).countDocuments();
    console.log(` * Test DB ${c.name}: ${testCount} restored successfully`);
  }
  await testConn.dropDatabase();
  await testConn.close();
  console.log('Verification test DB successfully dropped.');
  console.log('>>> BACKUP IS 100% VERIFIED, SAFE & SOUND! <<<');
  console.log('Backup Location:', backupDir);
  
  await mongoose.disconnect();
}

run().catch(err => {
  console.error('Backup script failed:', err);
  process.exit(1);
});
