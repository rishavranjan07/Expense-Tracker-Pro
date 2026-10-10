import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { CategoryPieChart, MonthlyTrendChart } from '../components/ExpenseCharts';
import { formatCurrency, getCategoryColor } from '../utils/formatters';
import {
  PieChart as PieIcon,
  TrendingUp,
  Download,
  Award,
} from 'lucide-react';

const AnalyticsPage = () => {
  const { summary, exportCSV } = useTransactions();
  const { user } = useAuth();

  const currency = user?.currency || '₹';
  const categoryBreakdown = summary?.categoryBreakdown || [];
  const topExpense = categoryBreakdown[0] || null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Financial Analytics &amp; Insights
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Deep dive into where your money flows and optimize your spending habits.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors cursor-pointer shadow-2xs"
        >
          <Download className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
          <span>Download CSV Report</span>
        </button>
      </div>

      {/* Highlights Banner Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Top Spending Category
              </p>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {topExpense ? topExpense.name : 'No data'}
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            {topExpense
              ? `${formatCurrency(topExpense.value, currency)} (${topExpense.percentage}% of all expenses)`
              : 'Add expenses to see top category'}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total Expenses Logged
              </p>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {formatCurrency(summary?.totalExpense || 0, currency)}
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            Across {categoryBreakdown.reduce((acc, c) => acc + (c.count || 0), 0)} individual expense records
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <PieIcon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Net Savings Rate
              </p>
              <h4 className="text-lg font-bold text-slate-900 dark:text-slate-100 mt-0.5">
                {summary?.savingsRate || 0}%
              </h4>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
            {summary?.savingsRate >= 20
              ? 'Excellent! You are meeting the 20% savings rule.'
              : 'Try reducing discretionary categories to increase savings.'}
          </p>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CategoryPieChart
          categoryBreakdown={summary?.categoryBreakdown || []}
          currency={currency}
        />
        <MonthlyTrendChart
          monthlyTrend={summary?.monthlyTrend || []}
          currency={currency}
        />
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            Category-wise Expense Breakdown
          </h3>
          <span className="text-xs text-slate-400 dark:text-slate-500">
            {categoryBreakdown.length} active categories
          </span>
        </div>

        {categoryBreakdown.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500">
            No expense data available to display breakdown.
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {categoryBreakdown.map((cat) => (
              <div key={cat.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-md"
                      style={{ backgroundColor: getCategoryColor(cat.name) }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{cat.name}</span>
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                      ({cat.count} transaction{cat.count > 1 ? 's' : ''})
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatCurrency(cat.value, currency)}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-semibold w-10 text-right">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{
                      width: `${cat.percentage}%`,
                      backgroundColor: getCategoryColor(cat.name),
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsPage;
