import React from 'react';
import { useTransactions } from '../context/TransactionContext';
import { CATEGORIES_LIST } from '../utils/formatters';
import {
  Search,
  Download,
  RotateCcw,
  Calendar,
  Layers,
} from 'lucide-react';

const FilterBar = () => {
  const { filters, setFilters, fetchTransactions, exportCSV } =
    useTransactions();

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setFilters((prev) => ({ ...prev, search: val, page: 1 }));
  };

  const handleTypeChange = (typeVal) => {
    setFilters((prev) => ({ ...prev, type: typeVal, page: 1 }));
  };

  const handleCategoryChange = (e) => {
    setFilters((prev) => ({ ...prev, category: e.target.value, page: 1 }));
  };

  const handleDateChange = (field, val) => {
    setFilters((prev) => ({ ...prev, [field]: val, page: 1 }));
  };

  const handleReset = () => {
    const defaultFilters = {
      type: '',
      category: 'All',
      startDate: '',
      endDate: '',
      search: '',
      sortBy: 'date_desc',
      page: 1,
    };
    setFilters(defaultFilters);
    fetchTransactions(defaultFilters);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4 mb-6 transition-colors">
      {/* Top row: Search, Type filters, Export */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search transactions by title or notes..."
            value={filters.search}
            onChange={handleSearchChange}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-800 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Type pills & Export */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Pills */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => handleTypeChange('')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filters.type === ''
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleTypeChange('expense')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filters.type === 'expense'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Expenses
            </button>
            <button
              onClick={() => handleTypeChange('income')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                filters.type === 'income'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Income
            </button>
          </div>

          {/* Export to CSV Button */}
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            title="Download CSV report"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Bottom row: Category, Date Range & Reset */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
        {/* Category */}
        <div>
          <label className="text-slate-500 dark:text-slate-400 mb-1 font-medium flex items-center gap-1">
            <Layers className="w-3 h-3" /> Category
          </label>
          <select
            value={filters.category}
            onChange={handleCategoryChange}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Categories</option>
            {CATEGORIES_LIST.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="text-slate-500 dark:text-slate-400 mb-1 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3" /> From Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="text-slate-500 dark:text-slate-400 mb-1 font-medium flex items-center gap-1">
            <Calendar className="w-3 h-3" /> To Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Reset */}
        <div className="flex items-end justify-between gap-2">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-lg transition-colors cursor-pointer w-full justify-center"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
