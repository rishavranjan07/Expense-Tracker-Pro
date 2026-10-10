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
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-800">
                Monthly Budget: {formatCurrency(budget, currency)}
              </h4>
              <p className="text-xs text-slate-500">
                Spent {formatCurrency(expense, currency)} ({budgetUsagePercent}%) • {formatCurrency(remainingBudget, currency)} remaining
              </p>
            </div>
          </div>
          <button
            onClick={onEditBudget}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Adjust Budget</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
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
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 shadow-xs mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-xl animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Budget Alert: {budgetUsagePercent}% Spent
              </h4>
              <p className="text-xs text-amber-700 font-medium">
                {budgetMessage} Remaining: {formatCurrency(remainingBudget, currency)}
              </p>
            </div>
          </div>
          <button
            onClick={onEditBudget}
            className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Adjust Budget</span>
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-amber-200/60 rounded-full h-2.5 overflow-hidden">
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
    <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-5 shadow-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-100 text-rose-700 rounded-xl animate-bounce">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-rose-900">
              Budget Exceeded! ({budgetUsagePercent}%)
            </h4>
            <p className="text-xs text-rose-700 font-medium">{budgetMessage}</p>
          </div>
        </div>
        <button
          onClick={onEditBudget}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-800 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Update Budget</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-rose-200/60 rounded-full h-2.5 overflow-hidden">
        <div className="bg-rose-600 h-2.5 rounded-full w-full" />
      </div>
    </div>
  );
};

export default BudgetAlert;
