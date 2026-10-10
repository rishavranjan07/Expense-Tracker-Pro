import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from 'recharts';
import { formatCurrency, getCategoryColor } from '../utils/formatters';
import { PieChart as PieIcon, TrendingUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const CategoryPieChart = ({ categoryBreakdown = [], currency = '₹' }) => {
  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center min-h-[340px] text-center transition-colors">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 mb-3">
          <PieIcon className="w-8 h-8" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Expense Data Yet</h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[240px]">
          Add your first expense transaction to see category distribution.
        </p>
      </div>
    );
  }

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 dark:bg-slate-800 text-white px-3 py-2 rounded-lg text-xs shadow-lg border border-slate-700">
          <p className="font-semibold">{data.name}</p>
          <p className="text-slate-300">
            Amount: {formatCurrency(data.value, currency)}
          </p>
          <p className="text-emerald-400 font-bold">{data.percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <PieIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Spending by Category
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Distribution of your expenses</p>
        </div>
      </div>

      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryBreakdown}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="value"
            >
              {categoryBreakdown.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={getCategoryColor(entry.name)}
                />
              ))}
            </Pie>
            <Tooltip content={customTooltip} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top 4 Categories Legend */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
        {categoryBreakdown.slice(0, 4).map((cat) => (
          <div key={cat.name} className="flex items-center gap-2 text-xs">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: getCategoryColor(cat.name) }}
            />
            <span className="truncate text-slate-600 dark:text-slate-400 max-w-[90px]">{cat.name}</span>
            <span className="ml-auto font-semibold text-slate-800 dark:text-slate-200">
              {cat.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const MonthlyTrendChart = ({ monthlyTrend = [], currency = '₹' }) => {
  const { isDark } = useTheme();

  if (!monthlyTrend || monthlyTrend.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center min-h-[340px] text-center transition-colors">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 mb-3">
          <TrendingUp className="w-8 h-8" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Trends Available</h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[240px]">
          Record income and expenses over time to analyze trends.
        </p>
      </div>
    );
  }

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 dark:bg-slate-800 text-white p-3 rounded-lg text-xs shadow-lg border border-slate-700 space-y-1">
          <p className="font-bold text-slate-200 mb-1">{label}</p>
          <p className="text-emerald-400">
            Income: {formatCurrency(payload[0]?.value, currency)}
          </p>
          <p className="text-rose-400">
            Expense: {formatCurrency(payload[1]?.value, currency)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Income vs Expenses Trend
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Last 6 months comparison</p>
        </div>
      </div>

      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? '#1e293b' : '#f1f5f9'} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: isDark ? '#94a3b8' : '#64748b', fontSize: 11 }}
              tickFormatter={(val) => `₹${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
            />
            <Tooltip content={customTooltip} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
            />
            <Bar
              name="Income"
              dataKey="income"
              fill="#10B981"
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
            />
            <Bar
              name="Expense"
              dataKey="expense"
              fill="#EF4444"
              radius={[4, 4, 0, 0]}
              maxBarSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
