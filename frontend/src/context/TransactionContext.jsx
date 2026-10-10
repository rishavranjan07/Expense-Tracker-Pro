import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
  });

  const [filters, setFilters] = useState({
    type: '',
    category: 'All',
    startDate: '',
    endDate: '',
    search: '',
    sortBy: 'date_desc',
    page: 1,
  });

  // Modal controls
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);

  // Fetch Dashboard Summary
  const fetchSummary = useCallback(async () => {
    if (!isAuthenticated) return;
    setSummaryLoading(true);
    try {
      const res = await api.get('/transactions/summary');
      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch summary:', err);
    } finally {
      setSummaryLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch Transactions List with Filters
  const fetchTransactions = useCallback(
    async (overrideFilters = {}) => {
      if (!isAuthenticated) return;
      setLoading(true);
      try {
        const queryParams = { ...filters, ...overrideFilters };
        // Clean empty values
        const params = new URLSearchParams();
        if (queryParams.type) params.append('type', queryParams.type);
        if (queryParams.category && queryParams.category !== 'All')
          params.append('category', queryParams.category);
        if (queryParams.startDate) params.append('startDate', queryParams.startDate);
        if (queryParams.endDate) params.append('endDate', queryParams.endDate);
        if (queryParams.search) params.append('search', queryParams.search);
        if (queryParams.sortBy) params.append('sortBy', queryParams.sortBy);
        params.append('page', queryParams.page || 1);
        params.append('limit', 20);

        const res = await api.get(`/transactions?${params.toString()}`);
        if (res.data.success) {
          setTransactions(res.data.data);
          setPagination({
            currentPage: res.data.currentPage,
            totalPages: res.data.totalPages,
            totalCount: res.data.totalCount,
          });
        }
      } catch (err) {
        console.error('Failed to fetch transactions:', err);
        toast.error('Could not load transactions');
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated, filters]
  );

  // Load initial data on auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchSummary();
      fetchTransactions();
    } else {
      setTransactions([]);
      setSummary(null);
    }
  }, [isAuthenticated, fetchSummary, fetchTransactions]);

  // Add Transaction
  const addTransaction = async (data) => {
    try {
      const res = await api.post('/transactions', data);
      if (res.data.success) {
        toast.success(res.data.message || 'Transaction added successfully!');
        fetchSummary();
        fetchTransactions();
        closeModal();
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add transaction';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Update Transaction
  const updateTransaction = async (id, data) => {
    try {
      const res = await api.put(`/transactions/${id}`, data);
      if (res.data.success) {
        toast.success(res.data.message || 'Transaction updated successfully!');
        fetchSummary();
        fetchTransactions();
        closeModal();
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update transaction';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Delete Transaction
  const deleteTransaction = async (id) => {
    try {
      const res = await api.delete(`/transactions/${id}`);
      if (res.data.success) {
        toast.success(res.data.message || 'Transaction deleted');
        fetchSummary();
        fetchTransactions();
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete transaction';
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  // Export CSV
  const exportCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.category && filters.category !== 'All')
        params.append('category', filters.category);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/transactions/export/csv?${params.toString()}`, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `ExpenseTracker_${new Date().toISOString().split('T')[0]}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV report downloaded successfully! 📊');
    } catch (err) {
      console.error('Error downloading CSV:', err);
      toast.error('Failed to export CSV');
    }
  };

  // Modal open helpers
  const openAddModal = (defaultType = 'expense') => {
    setModalMode('add');
    setEditingTransaction({
      title: '',
      amount: '',
      type: defaultType,
      category: defaultType === 'income' ? 'Salary' : 'Food & Dining',
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'UPI / Online',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (tx) => {
    setModalMode('edit');
    setEditingTransaction({
      ...tx,
      date: tx.date ? new Date(tx.date).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        summary,
        loading,
        summaryLoading,
        pagination,
        filters,
        setFilters,
        fetchSummary,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        exportCSV,
        isModalOpen,
        modalMode,
        editingTransaction,
        openAddModal,
        openEditModal,
        closeModal,
        isBudgetModalOpen,
        setIsBudgetModalOpen,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
