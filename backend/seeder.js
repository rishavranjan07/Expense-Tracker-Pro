const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Transaction = require('./models/Transaction');
const Group = require('./models/Group');
const GroupTransaction = require('./models/GroupTransaction');

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log('Connected to MongoDB for seeding...');

    // Clear existing sample user
    await User.deleteMany({ email: 'demo@expensetracker.com' });

    // Create Demo User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('demo1234', salt);

    const demoUser = await User.create({
      name: 'Rahul Sharma',
      email: 'demo@expensetracker.com',
      password: hashedPassword,
      monthlyBudget: 25000,
      currency: '₹',
    });

    console.log(`Created demo user: ${demoUser.email}`);

    // Remove any orphaned transactions
    await Transaction.deleteMany({ user: demoUser._id });

    // Dates helpers (current month & previous month)
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const sampleTransactions = [
      {
        user: demoUser._id,
        title: 'Monthly Salary Credit',
        amount: 65000,
        type: 'income',
        category: 'Salary',
        date: new Date(currentYear, currentMonth, 1),
        paymentMethod: 'Bank Transfer',
        notes: 'Tech Corp Full-time Monthly Salary',
      },
      {
        user: demoUser._id,
        title: 'Freelance Web Design Project',
        amount: 18000,
        type: 'income',
        category: 'Freelance',
        date: new Date(currentYear, currentMonth, 5),
        paymentMethod: 'UPI / Online',
        notes: 'Landing page delivery for client',
      },
      {
        user: demoUser._id,
        title: 'Apartment Monthly Rent',
        amount: 12000,
        type: 'expense',
        category: 'Rent & Housing',
        date: new Date(currentYear, currentMonth, 2),
        paymentMethod: 'Net Banking',
        notes: 'Paid to landlord',
      },
      {
        user: demoUser._id,
        title: 'BigBasket Grocery Stock',
        amount: 3450,
        type: 'expense',
        category: 'Groceries',
        date: new Date(currentYear, currentMonth, 3),
        paymentMethod: 'UPI / Online',
        notes: 'Vegetables, fruits & daily supplies',
      },
      {
        user: demoUser._id,
        title: 'Electricity & Water Bill',
        amount: 1650,
        type: 'expense',
        category: 'Bills & Utilities',
        date: new Date(currentYear, currentMonth, 6),
        paymentMethod: 'UPI / Online',
        notes: 'Monthly power board bill',
      },
      {
        user: demoUser._id,
        title: 'Dinner at Social Cafe',
        amount: 1420,
        type: 'expense',
        category: 'Food & Dining',
        date: new Date(currentYear, currentMonth, 7),
        paymentMethod: 'Credit Card',
        notes: 'Dinner with college friends',
      },
      {
        user: demoUser._id,
        title: 'Monthly Fuel / Petrol Refill',
        amount: 2200,
        type: 'expense',
        category: 'Transportation',
        date: new Date(currentYear, currentMonth, 8),
        paymentMethod: 'Debit Card',
        notes: 'HPCL petrol pump refill',
      },
      {
        user: demoUser._id,
        title: 'Myntra Weekend Wardrobe Sale',
        amount: 2890,
        type: 'expense',
        category: 'Shopping',
        date: new Date(currentYear, currentMonth, 9),
        paymentMethod: 'UPI / Online',
        notes: 'T-shirts and casual shoes',
      },
      {
        user: demoUser._id,
        title: 'Monthly Gym Membership',
        amount: 1500,
        type: 'expense',
        category: 'Health & Fitness',
        date: new Date(currentYear, currentMonth, 10),
        paymentMethod: 'UPI / Online',
        notes: 'Anytime Fitness fee',
      },
      // Previous Month Sample Data for Trends
      {
        user: demoUser._id,
        title: 'Previous Month Salary',
        amount: 65000,
        type: 'income',
        category: 'Salary',
        date: new Date(currentYear, currentMonth - 1, 1),
        paymentMethod: 'Bank Transfer',
        notes: 'Salary',
      },
      {
        user: demoUser._id,
        title: 'Previous Month Rent',
        amount: 12000,
        type: 'expense',
        category: 'Rent & Housing',
        date: new Date(currentYear, currentMonth - 1, 3),
        paymentMethod: 'Net Banking',
        notes: 'Rent',
      },
      {
        user: demoUser._id,
        title: 'Flight tickets to Goa',
        amount: 8500,
        type: 'expense',
        category: 'Travel',
        date: new Date(currentYear, currentMonth - 1, 15),
        paymentMethod: 'Credit Card',
        notes: 'Vacation tickets',
      },
    ];

    await Transaction.insertMany(sampleTransactions);
    console.log(`Inserted ${sampleTransactions.length} sample transactions.`);

    // ==========================================
    // Seed Sample Group with Approval & Transparency
    // ==========================================
    // Clean old demo groups
    await Group.deleteMany({ inviteCode: { $in: ['GRP-GOA26', 'GRP-FLAT402'] } });

    // Create a demo friend user
    let friendUser = await User.findOne({ email: 'priya@expensetracker.com' });
    if (!friendUser) {
      friendUser = await User.create({
        name: 'Priya Verma',
        email: 'priya@expensetracker.com',
        password: hashedPassword,
        monthlyBudget: 20000,
      });
    }

    // Create a pending request user
    let pendingUser = await User.findOne({ email: 'aman@expensetracker.com' });
    if (!pendingUser) {
      pendingUser = await User.create({
        name: 'Aman Gupta',
        email: 'aman@expensetracker.com',
        password: hashedPassword,
        monthlyBudget: 15000,
      });
    }

    const demoGroup = await Group.create({
      name: 'Flat 402 Roommates 🏠',
      description: 'Shared flat pool with common bank account, grocery & utility reimbursements',
      admin: demoUser._id,
      members: [demoUser._id, friendUser._id],
      pendingRequests: [pendingUser._id],
      inviteCode: 'GRP-FLAT402',
      currency: '₹',
    });

    await GroupTransaction.deleteMany({ group: demoGroup._id });

    const sampleGroupTx = [
      {
        group: demoGroup._id,
        title: 'Monthly Common Bank Deposit - Rahul',
        amount: 6000,
        type: 'deposit',
        paymentSource: 'personal',
        category: 'Group Pool Fund',
        paidBy: demoUser._id,
        addedBy: demoUser._id,
        date: new Date(currentYear, currentMonth, 1),
        notes: 'Transferred ₹6,000 into shared flat bank account',
      },
      {
        group: demoGroup._id,
        title: 'Monthly Common Bank Deposit - Priya',
        amount: 6000,
        type: 'deposit',
        paymentSource: 'personal',
        category: 'Group Pool Fund',
        paidBy: friendUser._id,
        addedBy: friendUser._id,
        date: new Date(currentYear, currentMonth, 1),
        notes: 'Transferred ₹6,000 into shared flat bank account',
      },
      {
        group: demoGroup._id,
        title: 'Flat Monthly Maintenance & Rent',
        amount: 5000,
        type: 'expense',
        paymentSource: 'common_bank',
        isReimbursed: false,
        category: 'Bills & Utilities',
        paidBy: demoUser._id,
        addedBy: demoUser._id,
        date: new Date(currentYear, currentMonth, 2),
        notes: 'Paid directly from shared bank account',
      },
      {
        group: demoGroup._id,
        title: 'Supermarket Groceries & Daily Supplies',
        amount: 1650,
        type: 'expense',
        paymentSource: 'personal',
        isReimbursed: false,
        category: 'Groceries & Supplies',
        paidBy: demoUser._id,
        addedBy: demoUser._id,
        date: new Date(currentYear, currentMonth, 4),
        notes: 'Paid out of personal pocket by Rahul - Needs refund from Common Bank!',
      },
      {
        group: demoGroup._id,
        title: 'Wifi Broadband & Electricity Bill',
        amount: 1450,
        type: 'expense',
        paymentSource: 'personal',
        isReimbursed: false,
        category: 'Bills & Utilities',
        paidBy: friendUser._id,
        addedBy: friendUser._id,
        date: new Date(currentYear, currentMonth, 5),
        notes: 'Paid out of personal pocket by Priya - Needs refund from Common Bank!',
      },
      {
        group: demoGroup._id,
        title: 'Water Tanker Refill',
        amount: 600,
        type: 'expense',
        paymentSource: 'personal',
        isReimbursed: true,
        reimbursedAt: new Date(currentYear, currentMonth, 6),
        category: 'Bills & Utilities',
        paidBy: demoUser._id,
        addedBy: demoUser._id,
        date: new Date(currentYear, currentMonth, 6),
        notes: 'Paid by Rahul - Already refunded back to Rahul from common bank',
      },
    ];

    await GroupTransaction.insertMany(sampleGroupTx);
    console.log(`Created sample group "${demoGroup.name}" with code ${demoGroup.inviteCode}`);
    console.log('✅ Demo dataset seeded successfully with Roommate Bank & Reimbursements!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();
