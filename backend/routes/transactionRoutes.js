const express = require('express');
const router = express.Router();
const {
  getTransactions,
  getTransactionById,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  exportCSV,
  getMeta,
} = require('../controllers/transactionController');
const { protect } = require('../middleware/authMiddleware');

// Public route for metadata (categories, payment methods)
router.get('/meta', getMeta);

// Protected routes
router.use(protect);

router.get('/summary', getSummary);
router.get('/export/csv', exportCSV);
router.route('/').get(getTransactions).post(addTransaction);
router
  .route('/:id')
  .get(getTransactionById)
  .put(updateTransaction)
  .delete(deleteTransaction);

module.exports = router;
