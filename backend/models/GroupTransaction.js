const mongoose = require('mongoose');

const GROUP_CATEGORIES = [
  'Food & Dining',
  'Travel & Transport',
  'Hotel & Accommodation',
  'Tickets & Activities',
  'Groceries & Supplies',
  'Shopping',
  'Bills & Utilities',
  'Fuel & Gas',
  'Entertainment',
  'Group Pool Fund',
  'Other',
];

const groupTransactionSchema = new mongoose.Schema(
  {
    group: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Group',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Transaction title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be greater than zero'],
    },
    type: {
      type: String,
      enum: ['expense', 'deposit'],
      default: 'expense',
      required: true,
    },
    paymentSource: {
      type: String,
      enum: ['personal', 'common_bank'],
      default: 'personal',
    },
    isReimbursed: {
      type: Boolean,
      default: false,
    },
    reimbursedAt: {
      type: Date,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: GROUP_CATEGORIES,
      default: 'Food & Dining',
    },
    paidBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Specify who contributed or expended this amount'],
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GroupTransaction', groupTransactionSchema);
module.exports.GROUP_CATEGORIES = GROUP_CATEGORIES;
