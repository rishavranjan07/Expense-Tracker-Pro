import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle2, SlidersHorizontal } from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

const BudgetAlert = ({ currentMonth, onEditBudget, currency = '₹' }) => {
  if (!currentMonth) return null;

  const { budget, expense, budgetUsagePercent, budgetAlertStatus, budgetMessage, remainingBudget } =
    currentMonth;

  // Safe mode
  if (budgetAlertStatus === 'safe') {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs mb-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Monthly Budget: {formatCurrency(budget, currency)}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Spent {formatCurrency(expense, currency)} ({budgetUsagePercent}%) • {formatCurrency(remainingBudget, currency)} remaining
              </p>
            </div>
          </div>
          <button
            onClick={onEditBudget}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 rounded-lg transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Adjust Budget</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  // Warning mode (80% - 99%)
  if (budgetAlertStatus === 'warning') {
    return (
      <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-5 shadow-xs mb-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 rounded-xl animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 dark:text-amber-200">
                Budget Alert: {budgetUsagePercent}% Spent
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                {budgetMessage} Remaining: {formatCurrency(remainingBudget, currency)}
              </p>
            </div>
          </div>
          <button
            onClick={onEditBudget}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 hover:bg-amber-200 dark:hover:bg-amber-800/60 rounded-lg transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Adjust Budget</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-amber-200/60 dark:bg-amber-950/60 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
          />
        </div>
      </div>
    );
  }

  // Danger mode (>= 100%)
  return (
    <div className="bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/60 rounded-2xl p-5 shadow-xs mb-6 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-400 rounded-xl animate-bounce">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
              Budget Exceeded! ({budgetUsagePercent}%)
            </h4>
            <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{budgetMessage}</p>
          </div>
        </div>
        <button
          onClick={onEditBudget}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/40 hover:bg-rose-200 dark:hover:bg-rose-800/60 rounded-lg transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Update Budget</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-rose-200/60 dark:bg-rose-950/60 rounded-full h-2.5 overflow-hidden">
        <div className="bg-rose-600 h-2.5 rounded-full w-full" />
      </div>
    </div>
  );
};

export default BudgetAlert;
