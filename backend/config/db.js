const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
    console.warn(`
----------------------------------------------------------------------
⚠️  DATABASE NOT CONNECTED:
    Mongoose could not reach the MongoDB server at:
    ${process.env.MONGO_URI}

    How to fix:
    1. For MongoDB Atlas (Recommended):
       Set your Atlas URI in backend/.env:
       MONGO_URI=mongodb+srv://<user>:<password>@cluster0.abcde.mongodb.net/expense_tracker_pro?retryWrites=true&w=majority
       (Make sure Network Access in Atlas allows 0.0.0.0/0)

    2. For Local MongoDB on Windows:
       Open CMD as Administrator and run:
       net start MongoDB
----------------------------------------------------------------------\n`);
  }
};

module.exports = connectDB;
