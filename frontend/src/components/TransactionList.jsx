import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import {
  formatCurrency,
  formatDate,
  getCategoryColor,
} from '../utils/formatters';
import {
  ArrowDownRight,
  ArrowUpRight,
  Pencil,
  Trash2,
  Inbox,
  CreditCard,
} from 'lucide-react';

const TransactionList = ({
  transactions = [],
  title = 'Recent Transactions',
  showViewAll = false,
  onViewAllClick,
}) => {
  const { openEditModal, deleteTransaction } = useTransactions();
  const { user } = useAuth();

  const handleDelete = (id, title) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      deleteTransaction(id);
    }
  };

  if (!transactions || transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center text-center transition-colors">
        <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-400 mb-3">
          <Inbox className="w-8 h-8" />
        </div>
        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Transactions Found</h4>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[260px]">
          No entries found matching your current filter criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors">
      {title && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h3>
          {showViewAll && (
            <button
              onClick={onViewAllClick}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors cursor-pointer"
            >
              View All →
            </button>
          )}
        </div>
      )}

      <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
        {transactions.map((tx) => {
          const isIncome = tx.type === 'income';
          return (
            <div
              key={tx._id}
              className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors gap-3"
            >
              {/* Left Details */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
                    isIncome
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {isIncome ? (
                    <ArrowUpRight className="w-5 h-5" />
                  ) : (
                    <ArrowDownRight className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {tx.title}
                    </p>
                    <span
                      className="inline-block w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: getCategoryColor(tx.category) }}
                      title={tx.category}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{tx.category}</span>
                    <span>•</span>
                    <span>{formatDate(tx.date)}</span>
                    {tx.paymentMethod && (
                      <>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-400">
                          <CreditCard className="w-3 h-3 text-slate-400" />
                          {tx.paymentMethod}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Amount & Actions */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <div className="text-left sm:text-right">
                  <span
                    className={`text-sm sm:text-base font-bold ${
                      isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {isIncome ? '+' : '-'} {formatCurrency(tx.amount, user?.currency || '₹')}
                  </span>
                  {tx.notes && (
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[150px]">
                      {tx.notes}
                    </p>
                  )}
                </div>

                {/* Edit & Delete Action Buttons */}
                <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEditModal(tx)}
                    title="Edit transaction"
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-lg transition-colors cursor-pointer"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(tx._id, tx.title)}
                    title="Delete transaction"
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-lg transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TransactionList;
