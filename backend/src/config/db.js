const mongoose = require('mongoose');

/**
 * Serverless MongoDB connection caching pattern for Vercel / AWS Lambda.
 * Caches the connection object and in-flight connection promise across warm invocations
 * to prevent connection churn and cold-start race conditions.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If connection is already open and active, return it immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/deva_co_billing';

  // If no connection is currently being established, initiate one
  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      maxPoolSize: 10,
      minPoolSize: 1,
      family: 4, // IPv4 first for stable cloud resolution
    };

    cached.promise = mongoose.connect(uri, opts).then((m) => {
      console.log(`[MongoDB] Connected successfully to host: ${m.connection.host}, database: ${m.connection.name}`);
      return m;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null; // Reset promise so subsequent requests can retry
    console.error(`[MongoDB] Connection error: ${error.message}`);
    // Never crash serverless environments (Vercel) with process.exit(1)
    if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
