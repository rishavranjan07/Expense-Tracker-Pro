const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!process.env.MONGO_URI) {
    console.error('❌ MONGO_URI is not defined in environment variables!');
    return null;
  }

  if (!cached.promise) {
    const opts = {
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts).then((mongooseInstance) => {
      console.log(`✅ MongoDB Connected successfully: ${mongooseInstance.connection.host}`);
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
    console.warn(`
----------------------------------------------------------------------
⚠️  DATABASE NOT CONNECTED:
    Mongoose could not reach MongoDB: ${error.message}

    How to fix:
    1. MongoDB Atlas Network Access (Crucial for Vercel / Remote):
       - Go to cloud.mongodb.com -> Network Access
       - Add IP Address -> Select "Allow Access from Anywhere" (0.0.0.0/0)
    2. Vercel Environment Variables:
       - Vercel Dashboard -> Settings -> Environment Variables
       - Add MONGO_URI, JWT_SECRET, JWT_EXPIRE
    3. Local MongoDB:
       - Set MONGO_URI in backend/.env
       - If using local MongoDB, run CMD as Admin: net start MongoDB
----------------------------------------------------------------------\n`);
    throw error;
  }
};

module.exports = connectDB;

