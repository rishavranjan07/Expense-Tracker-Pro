import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import {
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

const BudgetPage = () => {
  const { summary, fetchSummary } = useTransactions();
  const { user, updateBudget } = useAuth();

  const currency = user?.currency || '₹';
  const currentMonthData = summary?.currentMonth || {
    budget: user?.monthlyBudget || 20000,
    expense: 0,
    income: 0,
    budgetUsagePercent: 0,
    budgetAlertStatus: 'safe',
    budgetMessage: 'Your spending is within budget limits.',
    remainingBudget: 20000,
  };

  const [newBudget, setNewBudget] = useState(user?.monthlyBudget || 20000);
  const [isUpdating, setIsUpdating] = useState(false);

  // Calculate days remaining in current month
  const now = new Date();
  const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysRemaining = Math.max(1, lastDayOfMonth - now.getDate());
  const dailyAllowance = Math.max(
    0,
    Math.round(currentMonthData.remainingBudget / daysRemaining)
  );

  const handleSaveBudget = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const res = await updateBudget(newBudget, user?.currency || '₹');
    setIsUpdating(false);
    if (res.success) {
      fetchSummary();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
          Monthly Budget Planner
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Set monthly expense caps, receive automated threshold alerts, and maintain financial discipline.
        </p>
      </div>

      {/* Grid: Budget Overview & Budget Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Status & Progress */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-7 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Current Month Target
                </span>
                <h3 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">
                  {formatCurrency(currentMonthData.budget, currency)}
                </h3>
              </div>

              <div
                className={`px-3 py-1.5 rounded-xl text-xs font-bold self-start sm:self-auto flex items-center gap-1.5 ${
                  currentMonthData.budgetAlertStatus === 'danger'
                    ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300'
                    : currentMonthData.budgetAlertStatus === 'warning'
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                    : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                }`}
              >
                {currentMonthData.budgetAlertStatus === 'danger' ? (
                  <AlertTriangle className="w-4 h-4" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>
                  {currentMonthData.budgetAlertStatus === 'danger'
                    ? 'Budget Exceeded'
                    : currentMonthData.budgetAlertStatus === 'warning'
                    ? 'Budget Caution'
                    : 'Within Safe Limit'}
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-6 space-y-2">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-600 dark:text-slate-400">
                  Spent: {formatCurrency(currentMonthData.expense, currency)}
                </span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {currentMonthData.budgetUsagePercent}% Used
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-3 rounded-full transition-all duration-700 ${
                    currentMonthData.budgetUsagePercent >= 100
                      ? 'bg-rose-600'
                      : currentMonthData.budgetUsagePercent >= 80
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(currentMonthData.budgetUsagePercent, 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* 3 Metric Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Remaining Budget</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                  {formatCurrency(currentMonthData.remainingBudget, currency)}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Days Left in Month</span>
                <span className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 block">
                  {daysRemaining} days
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl">
                <span className="text-xs text-slate-500 dark:text-slate-400 block">Daily Spend Allowance</span>
                <span className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1 block">
                  ~{formatCurrency(dailyAllowance, currency)}/day
                </span>
              </div>
            </div>
          </div>

          {/* Smart Budget Rules & Insights */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Smart Budget Management Tips
            </h4>
            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                  1
                </span>
                <p>
                  <strong className="text-slate-800 dark:text-slate-200">50-30-20 Financial Rule:</strong> Aim to spend 50% on essentials (Rent, Groceries, Utilities), 30% on discretionary items (Dining, Entertainment), and save 20%.
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                  2
                </span>
                <p>
                  <strong className="text-slate-800 dark:text-slate-200">Automated Alerts:</strong> When your expenses reach 80% of your target limit, Expense Tracker Pro flags an amber warning alert on your dashboard so you never overspend.
                </p>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold flex items-center justify-center shrink-0">
                  3
                </span>
                <p>
                  <strong className="text-slate-800 dark:text-slate-200">Daily Allowance Tracking:</strong> Spending no more than {formatCurrency(dailyAllowance, currency)}/day will keep you safely within your monthly target limit.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Adjust Limit Form */}
        <div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs sticky top-24 transition-colors">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
              <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Update Monthly Target
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
              Change your monthly expenditure threshold at any time.
            </p>

            <form onSubmit={handleSaveBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Monthly Budget Amount ({currency})
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-slate-400 dark:text-slate-500 font-bold text-sm">
                    {currency}
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-base font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Quick Select Buttons */}
              <div>
                <label className="block text-xs text-slate-500 dark:text-slate-400 mb-2">
                  Quick Presets:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[10000, 20000, 30000, 40000, 50000, 75000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setNewBudget(preset)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        Number(newBudget) === preset
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                          : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      ₹{preset >= 1000 ? `${preset / 1000}k` : preset}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-xs shadow-indigo-600/30 transition-all hover:shadow cursor-pointer disabled:opacity-50"
              >
                {isUpdating ? 'Saving...' : 'Apply New Budget'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
