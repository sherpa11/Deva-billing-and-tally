const mongoose = require('mongoose');

async function seed() {
  const uri = 'mongodb://127.0.0.1:27017/deva_co_billing_simulation_test';
  console.log('Connecting to Simulation DB:', uri);
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  // Drop simulation DB to start 100% fresh
  await db.dropDatabase();
  console.log('Dropped any previous simulation database.');

  // Copy Users & Settings from production DB
  const prodConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/deva_co_billing').asPromise();
  const users = await prodConn.collection('users').find({}).toArray();
  const settings = await prodConn.collection('settings').find({}).toArray();
  await prodConn.close();

  if (users.length > 0) {
    await db.collection('users').insertMany(users);
    console.log(`Seeded ${users.length} users into simulation DB.`);
  }

  if (settings.length > 0) {
    await db.collection('settings').insertMany(settings);
    console.log(`Seeded settings into simulation DB.`);
  }

  console.log('Simulation DB is initialized and ready!');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Failed to seed simulation DB:', err);
  process.exit(1);
});
