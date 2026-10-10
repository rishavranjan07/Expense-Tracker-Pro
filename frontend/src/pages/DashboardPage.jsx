import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTransactions } from '../context/TransactionContext';
import StatCard from '../components/StatCard';
import BudgetAlert from '../components/BudgetAlert';
import { CategoryPieChart, MonthlyTrendChart } from '../components/ExpenseCharts';
import TransactionList from '../components/TransactionList';
import { formatCurrency } from '../utils/formatters';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const { summary, summaryLoading, openAddModal, setIsBudgetModalOpen } =
    useTransactions();
  const navigate = useNavigate();

  const currency = user?.currency || '₹';

  const balance = summary ? summary.balance : 0;
  const totalIncome = summary ? summary.totalIncome : 0;
  const totalExpense = summary ? summary.totalExpense : 0;
  const savingsRate = summary ? summary.savingsRate : 0;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Hello, {user?.name || 'Explorer'} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here is your financial snapshot and spending breakdown.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => openAddModal('income')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            <span>Add Income</span>
          </button>
          <button
            onClick={() => openAddModal('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-all cursor-pointer shadow-2xs"
          >
            <ArrowDownRight className="w-4 h-4 text-rose-600" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Total Balance"
          amount={formatCurrency(balance, currency)}
          subtitle={
            balance >= 0
              ? 'Net positive cash flow'
              : 'Caution: Expenses exceed income'
          }
          icon={Wallet}
          variant="indigo"
          badgeText={balance >= 0 ? 'Surplus' : 'Deficit'}
        />

        <StatCard
          title="Total Income"
          amount={formatCurrency(totalIncome, currency)}
          subtitle="All recorded earnings"
          icon={TrendingUp}
          variant="emerald"
        />

        <StatCard
          title="Total Expenses"
          amount={formatCurrency(totalExpense, currency)}
          subtitle="All recorded spending"
          icon={TrendingDown}
          variant="rose"
        />

        <StatCard
          title="Savings Rate"
          amount={`${savingsRate}%`}
          subtitle={
            savingsRate > 20
              ? 'Great job on saving!'
              : 'Target at least 20% savings'
          }
          icon={PiggyBank}
          variant="amber"
          badgeText={savingsRate >= 20 ? 'Optimal' : 'Needs attention'}
        />
      </div>

      {/* Smart Monthly Budget Bar & Alert */}
      <BudgetAlert
        currentMonth={summary?.currentMonth}
        onEditBudget={() => setIsBudgetModalOpen(true)}
        currency={currency}
      />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <CategoryPieChart
            categoryBreakdown={summary?.categoryBreakdown || []}
            currency={currency}
          />
        </div>
        <div className="lg:col-span-2">
          <MonthlyTrendChart
            monthlyTrend={summary?.monthlyTrend || []}
            currency={currency}
          />
        </div>
      </div>

      {/* Recent Transactions Section */}
      <div>
        <TransactionList
          transactions={summary?.recentTransactions || []}
          title="Recent Transactions"
          showViewAll={true}
          onViewAllClick={() => navigate('/transactions')}
        />
      </div>
    </div>
  );
};

export default DashboardPage;
