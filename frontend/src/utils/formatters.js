export const formatCurrency = (amount, currency = '₹') => {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return `${currency}0`;
  }
  return `${currency}${Number(amount).toLocaleString('en-IN')}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

export const formatDateInput = (dateString) => {
  if (!dateString) return new Date().toISOString().split('T')[0];
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

export const CATEGORY_COLORS = {
  // Expenses
  'Food & Dining': '#F59E0B',      // Amber
  'Shopping': '#EC4899',           // Pink
  'Transportation': '#3B82F6',     // Blue
  'Bills & Utilities': '#EF4444',  // Red
  'Entertainment': '#8B5CF6',      // Purple
  'Health & Fitness': '#10B981',   // Emerald
  'Education': '#06B6D4',          // Cyan
  'Rent & Housing': '#6366F1',     // Indigo
  'Travel': '#14B8A6',             // Teal
  'Groceries': '#84CC16',          // Lime
  // Income
  'Salary': '#10B981',             // Emerald
  'Freelance': '#6366F1',          // Indigo
  'Investments': '#3B82F6',        // Blue
  'Pocket Money / Allowance': '#F59E0B', // Amber
  'Gift / Bonus': '#EC4899',       // Pink
  'Business': '#8B5CF6',           // Purple
  'Other': '#64748B',              // Slate
};

export const getCategoryColor = (category) => {
  return CATEGORY_COLORS[category] || '#64748B';
};

export const CATEGORIES_LIST = [
  'Food & Dining',
  'Shopping',
  'Transportation',
  'Bills & Utilities',
  'Entertainment',
  'Health & Fitness',
  'Education',
  'Rent & Housing',
  'Travel',
  'Groceries',
  'Salary',
  'Freelance',
  'Investments',
  'Pocket Money / Allowance',
  'Gift / Bonus',
  'Business',
  'Other',
];

export const PAYMENT_METHODS_LIST = [
  'UPI / Online',
  'Cash',
  'Credit Card',
  'Debit Card',
  'Net Banking',
  'Other',
];
