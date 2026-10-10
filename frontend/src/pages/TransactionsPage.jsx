import React, { useEffect } from 'react';
import { useTransactions } from '../context/TransactionContext';
import FilterBar from '../components/FilterBar';
import TransactionList from '../components/TransactionList';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';

const TransactionsPage = () => {
  const {
    transactions,
    loading,
    pagination,
    filters,
    setFilters,
    fetchTransactions,
    openAddModal,
  } = useTransactions();

  useEffect(() => {
    fetchTransactions();
  }, [filters.page, filters.type, filters.category, filters.startDate, filters.endDate, filters.search]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setFilters((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Transaction History
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-200 text-slate-700 rounded-full">
              {pagination.totalCount} records
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Search, filter, edit and export your financial transactions.
          </p>
        </div>

        <button
          onClick={() => openAddModal('expense')}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all hover:shadow cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Transaction</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar />

      {/* Transactions List */}
      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500">Loading transactions...</p>
        </div>
      ) : (
        <TransactionList
          transactions={transactions}
          title=""
          showViewAll={false}
        />
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-500">
            Showing Page <span className="font-semibold text-slate-800">{pagination.currentPage}</span> of{' '}
            <span className="font-semibold text-slate-800">{pagination.totalPages}</span>
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;
