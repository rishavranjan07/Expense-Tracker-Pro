const Transaction = require('../models/Transaction');
const { CATEGORIES, PAYMENT_METHODS } = require('../models/Transaction');
const User = require('../models/User');

// @desc    Get all transactions with filtering, search & sorting
// @route   GET /api/transactions
// @access  Private
const getTransactions = async (req, res, next) => {
  try {
    const {
      type,
      category,
      startDate,
      endDate,
      search,
      sortBy = 'date_desc',
      page = 1,
      limit = 50,
    } = req.query;

    const query = { user: req.user.id };

    // Filter by type (income/expense)
    if (type && ['income', 'expense'].includes(type)) {
      query.type = type;
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    // Search by title or notes
    if (search && search.trim() !== '') {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { notes: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    // Sorting
    let sortOptions = { date: -1, createdAt: -1 };
    if (sortBy === 'date_asc') sortOptions = { date: 1, createdAt: 1 };
    else if (sortBy === 'amount_desc') sortOptions = { amount: -1 };
    else if (sortBy === 'amount_asc') sortOptions = { amount: 1 };

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const totalCount = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: transactions.length,
      totalCount,
      currentPage: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      data: transactions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction by ID
// @route   GET /api/transactions/:id
// @access  Private
const getTransactionById = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found',
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new transaction
// @route   POST /api/transactions
// @access  Private
const addTransaction = async (req, res, next) => {
  try {
    const { title, amount, type, category, date, paymentMethod, notes } =
      req.body;

    if (!title || !amount || !type || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, amount, type, and category',
      });
    }

    const transaction = await Transaction.create({
      user: req.user.id,
      title: title.trim(),
      amount: Math.abs(Number(amount)),
      type,
      category,
      date: date ? new Date(date) : new Date(),
      paymentMethod: paymentMethod || 'UPI / Online',
      notes: notes ? notes.trim() : '',
    });

    res.status(201).json({
      success: true,
      data: transaction,
      message: `${type === 'income' ? 'Income' : 'Expense'} of ₹${transaction.amount} recorded!`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update transaction
// @route   PUT /api/transactions/:id
// @access  Private
const updateTransaction = async (req, res, next) => {
  try {
    let transaction = await Transaction.findOne({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized',
      });
    }

    const { title, amount, type, category, date, paymentMethod, notes } =
      req.body;

    if (title) transaction.title = title.trim();
    if (amount !== undefined) transaction.amount = Math.abs(Number(amount));
    if (type) transaction.type = type;
    if (category) transaction.category = category;
    if (date) transaction.date = new Date(date);
    if (paymentMethod) transaction.paymentMethod = paymentMethod;
    if (notes !== undefined) transaction.notes = notes.trim();

    await transaction.save();

    res.json({
      success: true,
      data: transaction,
      message: 'Transaction updated successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete transaction
// @route   DELETE /api/transactions/:id
// @access  Private
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found or unauthorized',
      });
    }

    res.json({
      success: true,
      data: {},
      message: 'Transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get dashboard summary, aggregations, monthly budget alert & charts data
// @route   GET /api/transactions/summary
// @access  Private
const getSummary = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch user for monthly budget
    const user = await User.findById(userId);
    const monthlyBudget = user ? user.monthlyBudget : 20000;

    // Overall Totals
    const allTransactions = await Transaction.find({ user: userId });

    let totalIncome = 0;
    let totalExpense = 0;

    // Current month calculations
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();
    let currentMonthExpense = 0;
    let currentMonthIncome = 0;

    // Category breakdown map for expenses
    const categoryMap = {};

    allTransactions.forEach((tx) => {
      const amt = Number(tx.amount);
      const txDate = new Date(tx.date);

      if (tx.type === 'income') {
        totalIncome += amt;
        if (
          txDate.getFullYear() === currentYear &&
          txDate.getMonth() === currentMonth
        ) {
          currentMonthIncome += amt;
        }
      } else if (tx.type === 'expense') {
        totalExpense += amt;
        if (
          txDate.getFullYear() === currentYear &&
          txDate.getMonth() === currentMonth
        ) {
          currentMonthExpense += amt;
        }

        // Category mapping
        if (!categoryMap[tx.category]) {
          categoryMap[tx.category] = { name: tx.category, value: 0, count: 0 };
        }
        categoryMap[tx.category].value += amt;
        categoryMap[tx.category].count += 1;
      }
    });

    const balance = totalIncome - totalExpense;
    const savingsRate =
      totalIncome > 0
        ? Math.round(((totalIncome - totalExpense) / totalIncome) * 100)
        : 0;

    // Monthly Budget Status
    const budgetUsagePercent =
      monthlyBudget > 0
        ? Math.round((currentMonthExpense / monthlyBudget) * 100)
        : 0;
    let budgetAlertStatus = 'safe'; // 'safe', 'warning', 'danger'
    let budgetMessage = `You have spent ${budgetUsagePercent}% of your monthly budget.`;

    if (budgetUsagePercent >= 100) {
      budgetAlertStatus = 'danger';
      budgetMessage = `⚠️ Alert! You have exceeded your monthly budget by ₹${(
        currentMonthExpense - monthlyBudget
      ).toLocaleString('en-IN')}!`;
    } else if (budgetUsagePercent >= 80) {
      budgetAlertStatus = 'warning';
      budgetMessage = `⚡ Caution: You have consumed ${budgetUsagePercent}% of your monthly budget limit!`;
    }

    // Format category distribution
    const categoryBreakdown = Object.values(categoryMap).map((cat) => ({
      ...cat,
      percentage:
        totalExpense > 0 ? Math.round((cat.value / totalExpense) * 100) : 0,
    }));
    categoryBreakdown.sort((a, b) => b.value - a.value);

    // Monthly Trend (Last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const mName = d.toLocaleString('en-US', { month: 'short' });
      const year = d.getFullYear();
      const monthIdx = d.getMonth();

      let mIncome = 0;
      let mExpense = 0;

      allTransactions.forEach((tx) => {
        const tDate = new Date(tx.date);
        if (
          tDate.getFullYear() === year &&
          tDate.getMonth() === monthIdx
        ) {
          if (tx.type === 'income') mIncome += tx.amount;
          if (tx.type === 'expense') mExpense += tx.amount;
        }
      });

      monthlyTrend.push({
        month: `${mName} ${year.toString().slice(-2)}`,
        income: mIncome,
        expense: mExpense,
        savings: mIncome - mExpense,
      });
    }

    // Recent Transactions (latest 5)
    const recentTransactions = await Transaction.find({ user: userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        savingsRate,
        currentMonth: {
          income: currentMonthIncome,
          expense: currentMonthExpense,
          balance: currentMonthIncome - currentMonthExpense,
          budget: monthlyBudget,
          budgetUsagePercent,
          budgetAlertStatus,
          budgetMessage,
          remainingBudget: Math.max(0, monthlyBudget - currentMonthExpense),
        },
        categoryBreakdown,
        monthlyTrend,
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Export filtered transactions to CSV
// @route   GET /api/transactions/export/csv
// @access  Private
const exportCSV = async (req, res, next) => {
  try {
    const { type, category, startDate, endDate } = req.query;
    const query = { user: req.user.id };

    if (type && ['income', 'expense'].includes(type)) query.type = type;
    if (category && category !== 'All') query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    const transactions = await Transaction.find(query).sort({ date: -1 });

    // CSV Header
    let csv = 'ID,Date,Title,Type,Category,Amount,Payment Method,Notes\n';

    transactions.forEach((tx) => {
      const dateFormatted = new Date(tx.date).toISOString().split('T')[0];
      const cleanTitle = `"${(tx.title || '').replace(/"/g, '""')}"`;
      const cleanNotes = `"${(tx.notes || '').replace(/"/g, '""')}"`;
      csv += `${tx._id},${dateFormatted},${cleanTitle},${tx.type},${tx.category},${tx.amount},"${tx.paymentMethod}",${cleanNotes}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=ExpenseTracker_${new Date().toISOString().split('T')[0]}.csv`
    );
    res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// @desc    Get category & metadata lists
// @route   GET /api/transactions/meta
// @access  Public
const getMeta = (req, res) => {
  res.json({
    success: true,
    data: {
      categories: CATEGORIES,
      paymentMethods: PAYMENT_METHODS,
    },
  });
};

module.exports = {
  getTransactions,
  getTransactionById,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getSummary,
  exportCSV,
  getMeta,
};
