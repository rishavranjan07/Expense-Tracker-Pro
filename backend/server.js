const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Expense Tracker Pro API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

const mongoose = require('mongoose');

// Check Database Connection Health Middleware
app.use(async (req, res, next) => {
  // Allow health check without DB
  if (req.path === '/api/health') return next();

  // If not connected, attempt connection
  if (mongoose.connection.readyState !== 1) {
    try {
      await connectDB();
    } catch (err) {
      return res.status(503).json({
        success: false,
        message:
          'MongoDB is not connected! Please verify MONGO_URI and ensure MongoDB Atlas Network Access has 0.0.0.0/0 enabled. Error: ' +
          err.message,
      });
    }
  }
  next();
});

// Mount Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/groups', require('./routes/groupRoutes'));

// Custom Error Handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Only start listener if not running in serverless / Vercel environment
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`
==================================================
🚀 Expense Tracker Pro Backend Server Running!
📡 PORT: ${PORT}
🌍 URL: http://localhost:${PORT}
⚡ Health Check: http://localhost:${PORT}/api/health
==================================================
    `);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Error: ${err.message}`);
});

module.exports = app;

