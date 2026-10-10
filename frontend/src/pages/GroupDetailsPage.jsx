import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency, formatDate, formatDateInput } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Users,
  Plus,
  ShieldCheck,
  UserPlus,
  Check,
  X,
  Copy,
  Receipt,
  Pencil,
  Trash2,
  Calendar,
  Tag,
  CreditCard,
  FileText,
  UserCheck,
  AlertCircle,
  TrendingUp,
  Scale,
  PiggyBank,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Building2,
  HandCoins,
  RefreshCw,
  BadgeAlert,
} from 'lucide-react';

const GROUP_CATEGORIES = [
  'Food & Dining',
  'Travel & Transport',
  'Hotel & Accommodation',
  'Tickets & Activities',
  'Groceries & Supplies',
  'Shopping',
  'Bills & Utilities',
  'Fuel & Gas',
  'Entertainment',
  'Group Pool Fund',
  'Other',
];

const GroupDetailsPage = () => {
  const { id: groupId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [groupData, setGroupData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending_refund' | 'expense' | 'deposit'

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [editingTx, setEditingTx] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense', // 'expense' | 'deposit'
    paymentSource: 'personal', // 'personal' (paid out of personal pocket) | 'common_bank' (paid from pool bank)
    category: 'Food & Dining',
    paidBy: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const fetchGroupDetails = async () => {
    try {
      const res = await api.get(`/groups/${groupId}`);
      if (res.data.success) {
        setGroupData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching group details:', err);
      toast.error(err.response?.data?.message || 'Could not load group details');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-16 border border-slate-200/80 shadow-xs flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
        <p className="text-xs font-semibold text-slate-500">
          Loading common bank & reimbursement dashboard...
        </p>
      </div>
    );
  }

  if (!groupData) return null;

  const { group, transactions, summary } = groupData;
  const isApproved = group.isUserApproved;
  const isPending = group.isUserPending;
  const isAdmin = group.isUserAdmin;
  const currency = group.currency || '₹';
  const commonBank = summary?.commonBank || {};

  // Find current user's settlement status
  const currentMemberSettlement = summary?.settlements?.find(
    (s) => s._id?.toString() === user?._id?.toString()
  );

  // Copy invite code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(group.inviteCode);
    setCopiedCode(true);
    toast.success('Invite code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Admin approves join request
  const handleApprove = async (userId, memberName) => {
    try {
      const res = await api.put(`/groups/${groupId}/requests/${userId}/approve`);
      if (res.data.success) {
        toast.success(`Approved ${memberName} to join the group!`);
        fetchGroupDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve');
    }
  };

  // Admin rejects join request
  const handleReject = async (userId, memberName) => {
    try {
      const res = await api.put(`/groups/${groupId}/requests/${userId}/reject`);
      if (res.data.success) {
        toast.success(`Rejected join request from ${memberName}.`);
        fetchGroupDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  // Delete Group (Admin only)
  const handleDeleteGroup = async () => {
    if (
      window.confirm(
        `Are you sure you want to delete "${group.name}"? All shared expenses will be removed permanently.`
      )
    ) {
      try {
        const res = await api.delete(`/groups/${groupId}`);
        if (res.data.success) {
          toast.success(res.data.message || 'Group deleted');
          navigate('/groups');
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete group');
      }
    }
  };

  // Open Add Expenditure modal
  const openAddExpenseModal = () => {
    setModalMode('add');
    setEditingTx(null);
    setFormData({
      title: '',
      amount: '',
      type: 'expense',
      paymentSource: 'personal', // Defaults to personal so they can get reimbursed from Common Bank!
      category: 'Food & Dining',
      paidBy: user?._id || group.members[0]?._id,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    });
    setIsModalOpen(true);
  };

  // Open Add Money (Deposit / Pool Fund) modal
  const openAddMoneyModal = () => {
    setModalMode('add');
    setEditingTx(null);
    setFormData({
      title: 'Deposited to Common Bank Pool',
      amount: '',
      type: 'deposit',
      paymentSource: 'personal',
      category: 'Group Pool Fund',
      paidBy: user?._id || group.members[0]?._id,
      date: new Date().toISOString().split('T')[0],
      notes: 'Monthly roommate deposit into common bank account',
    });
    setIsModalOpen(true);
  };

  // Open Edit Transaction modal
  const openEditModal = (tx) => {
    setModalMode('edit');
    setEditingTx(tx);
    setFormData({
      title: tx.title,
      amount: tx.amount,
      type: tx.type || 'expense',
      paymentSource: tx.paymentSource || 'personal',
      category: tx.category || 'Food & Dining',
      paidBy: tx.paidBy?._id || tx.paidBy,
      date: formatDateInput(tx.date),
      notes: tx.notes || '',
    });
    setIsModalOpen(true);
  };

  // Handle Save Transaction
  const handleSaveTransaction = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.amount) return;

    setSubmitting(true);
    try {
      if (modalMode === 'edit') {
        const res = await api.put(
          `/groups/${groupId}/transactions/${editingTx._id}`,
          formData
        );
        if (res.data.success) {
          toast.success(res.data.message || 'Group transaction updated!');
          setIsModalOpen(false);
          fetchGroupDetails();
        }
      } else {
        const res = await api.post(`/groups/${groupId}/transactions`, formData);
        if (res.data.success) {
          toast.success(res.data.message || 'Added successfully!');
          setIsModalOpen(false);
          fetchGroupDetails();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Reimbursement from Common Bank
  const handleToggleReimburse = async (txId, txTitle) => {
    try {
      const res = await api.put(`/groups/${groupId}/transactions/${txId}/reimburse`);
      if (res.data.success) {
        toast.success(res.data.message);
        fetchGroupDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update reimbursement');
    }
  };

  // Delete Transaction
  const handleDeleteTransaction = async (txId, title) => {
    if (window.confirm(`Delete "${title}"?`)) {
      try {
        const res = await api.delete(`/groups/${groupId}/transactions/${txId}`);
        if (res.data.success) {
          toast.success(res.data.message || 'Deleted successfully');
          fetchGroupDetails();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete');
      }
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'pending_refund') {
      return (
        (tx.type || 'expense') === 'expense' &&
        (tx.paymentSource || 'personal') === 'personal' &&
        !tx.isReimbursed
      );
    }
    if (activeTab === 'expense') return (tx.type || 'expense') === 'expense';
    if (activeTab === 'deposit') return tx.type === 'deposit';
    return true;
  });

  // If user is waiting for approval
  if (isPending) {
    return (
      <div className="max-w-xl mx-auto my-8 bg-white rounded-3xl p-8 border border-amber-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">
          Membership Pending Approval
        </h2>
        <p className="text-sm text-slate-600">
          You have requested to join <strong>{group.name}</strong>. The group admin (
          <strong>{group.admin?.name}</strong>) must approve your request before you can view
          transactions or add expenses.
        </p>
        <div className="pt-2">
          <button
            onClick={() => navigate('/groups')}
            className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            ← Back to All Groups
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Navigation & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
        <div className="flex items-start gap-3">
          <button
            onClick={() => navigate('/groups')}
            className="p-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl transition-colors shrink-0 cursor-pointer shadow-2xs"
            title="Back to Groups"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {group.name}
              </h1>
              {isAdmin && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                  <ShieldCheck className="w-3.5 h-3.5" /> Group Admin
                </span>
              )}
            </div>
            {group.description && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {group.description}
              </p>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Invite Code Pill */}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-mono font-bold transition-colors cursor-pointer"
            title="Click to copy invite code"
          >
            {copiedCode ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Copy className="w-4 h-4 text-slate-500" />
            )}
            <span>Invite: {group.inviteCode}</span>
          </button>

          {/* Add Money (Common Bank Deposit) Button */}
          <button
            onClick={openAddMoneyModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <PiggyBank className="w-4 h-4" />
            <span>+ Deposit to Bank Pool</span>
          </button>

          {/* Add Expenditure Button */}
          <button
            onClick={openAddExpenseModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs sm:text-sm font-semibold shadow-sm shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Expenditure</span>
          </button>

          {/* Admin Delete Group Button */}
          {isAdmin && (
            <button
              onClick={handleDeleteGroup}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer border border-rose-200/60"
              title="Delete group"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Admin Pending Requests Approval Alert */}
      {isAdmin && group.pendingRequests?.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <UserPlus className="w-5 h-5 text-amber-700" />
            <h4 className="text-sm font-bold text-amber-900">
              Join Requests Awaiting Your Approval ({group.pendingRequests.length})
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {group.pendingRequests.map((reqUser) => (
              <div
                key={reqUser._id}
                className="bg-white p-3 rounded-xl border border-amber-200/80 flex items-center justify-between gap-2 shadow-2xs"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {reqUser.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">
                    {reqUser.email}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleApprove(reqUser._id, reqUser.name)}
                    className="p-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-xs font-bold cursor-pointer"
                    title="Approve access"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleReject(reqUser._id, reqUser.name)}
                    className="p-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-lg text-xs font-bold cursor-pointer"
                    title="Reject access"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🏦 Common Bank Account Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold tracking-wider uppercase mb-1">
              <Building2 className="w-4 h-4" />
              <span>Common Flat Bank Account</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              {formatCurrency(commonBank?.currentBankBalance || 0, currency)}
            </h2>
            <p className="text-xs text-slate-300 mt-1.5 flex items-center gap-2">
              <span>Actual Cash in Bank Pool right now</span>
              <span>•</span>
              <span className="text-emerald-400 font-semibold">
                Deposited: {formatCurrency(commonBank?.totalDeposited || 0, currency)}
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div>
              <span className="text-slate-300 block text-[11px]">Total Flat Expenses</span>
              <span className="font-extrabold text-white text-base block mt-0.5">
                {formatCurrency(commonBank?.totalExpenses || 0, currency)}
              </span>
            </div>

            <div>
              <span className="text-amber-300 block text-[11px] font-semibold">
                Pending Refunds
              </span>
              <span className="font-extrabold text-amber-400 text-base block mt-0.5">
                {formatCurrency(commonBank?.pendingReimbursementAmount || 0, currency)}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-emerald-300 block text-[11px] font-semibold">
                Net After Refunds
              </span>
              <span
                className={`font-extrabold text-base block mt-0.5 ${
                  (commonBank?.netBankBalanceAfterRefunds || 0) >= 0
                    ? 'text-emerald-400'
                    : 'text-rose-400'
                }`}
              >
                {formatCurrency(commonBank?.netBankBalanceAfterRefunds || 0, currency)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔔 PENDING REIMBURSEMENTS CALLOUT (Kisko Common Bank se kitne paise wapas milenge) */}
      {summary?.pendingReimbursementsList && summary.pendingReimbursementsList.length > 0 && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-2xl p-5 sm:p-6 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <HandCoins className="w-5 h-5 text-amber-700" />
              <h3 className="text-base font-bold text-amber-950">
                Pending Refunds from Common Bank ({summary.pendingReimbursementsList.length} expenses)
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-900 bg-amber-200/80 px-2.5 py-1 rounded-full">
              Total to refund: {formatCurrency(commonBank?.pendingReimbursementAmount || 0, currency)}
            </span>
          </div>
          <p className="text-xs text-amber-800 mb-4">
            Roommates ne yeh kharcha apne personal pocket/UPI se kiya hai. Common bank account se inko yeh paise wapas milenge. Bank transfer karne ke baad "Mark as Reimbursed" click karein:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.pendingReimbursementsList.map((item) => (
              <div
                key={item._id}
                className="bg-white p-4 rounded-xl border border-amber-200 flex flex-col justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider bg-amber-100 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Paid by <strong>{item.paidByName}</strong> on {formatDate(item.date)}
                    </p>
                  </div>
                  <span className="text-base font-black text-rose-600 shrink-0">
                    {formatCurrency(item.amount, currency)}
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-emerald-700">
                    👉 {item.paidByName} gets {formatCurrency(item.amount, currency)} back
                  </span>
                  <button
                    onClick={() => handleToggleReimburse(item._id, item.title)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Mark as Reimbursed</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4 Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Total Flat Expenses
          </p>
          <h3 className="text-2xl font-black text-slate-900 mt-1">
            {formatCurrency(summary?.totalExpenses || 0, currency)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Across {summary?.transactionCount || 0} flat records
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Equal Share / Roommate
          </p>
          <h3 className="text-2xl font-black text-indigo-600 mt-1">
            {formatCurrency(summary?.equalSharePerMember || 0, currency)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Each person's fair flat share
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Your Personal Pending Refund
          </p>
          <h3 className="text-2xl font-black text-amber-600 mt-1">
            {formatCurrency(currentMemberSettlement?.pendingReimbursementOwed || 0, currency)}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Paisa jo bank se abhi milna hai
          </p>
        </div>

        <div
          className={`p-5 rounded-2xl border shadow-xs ${
            (currentMemberSettlement?.netBalance || 0) > 0
              ? 'bg-emerald-50/70 border-emerald-200'
              : (currentMemberSettlement?.netBalance || 0) < 0
              ? 'bg-rose-50/70 border-rose-200'
              : 'bg-white border-slate-200/80'
          }`}
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Your Net Month-End Settlement
          </p>
          <h3
            className={`text-2xl font-black mt-1 ${
              (currentMemberSettlement?.netBalance || 0) > 0
                ? 'text-emerald-700'
                : (currentMemberSettlement?.netBalance || 0) < 0
                ? 'text-rose-700'
                : 'text-slate-800'
            }`}
          >
            {(currentMemberSettlement?.netBalance || 0) > 0
              ? `+ ${formatCurrency(currentMemberSettlement.netBalance, currency)}`
              : (currentMemberSettlement?.netBalance || 0) < 0
              ? `- ${formatCurrency(Math.abs(currentMemberSettlement.netBalance), currency)}`
              : 'Settled Up'}
          </h3>
          <p
            className={`text-xs mt-1 font-semibold ${
              (currentMemberSettlement?.netBalance || 0) > 0
                ? 'text-emerald-700'
                : (currentMemberSettlement?.netBalance || 0) < 0
                ? 'text-rose-700'
                : 'text-slate-500'
            }`}
          >
            {(currentMemberSettlement?.netBalance || 0) > 0
              ? '🎉 Overall you get extra refund!'
              : (currentMemberSettlement?.netBalance || 0) < 0
              ? '⚠️ You underpaid your share'
              : 'Perfect flat balance'}
          </p>
        </div>
      </div>

      {/* 📊 Member Transparency & Common Bank Refund Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Roommate Transparency: Deposits, Out-of-Pocket Expenses & Refunds
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Equal Share: <strong>{formatCurrency(summary?.equalSharePerMember || 0, currency)}</strong> / person
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-6 py-3">Roommate</th>
                <th className="px-4 py-3">Deposited in Bank</th>
                <th className="px-4 py-3">Personal Out-of-Pocket</th>
                <th className="px-4 py-3">Bank Refund Owed Now</th>
                <th className="px-4 py-3">Equal Flat Share</th>
                <th className="px-6 py-3 text-right">Net Month-End Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {summary?.settlements?.map((m) => {
                const isUser = m._id?.toString() === user?._id?.toString();
                return (
                  <tr
                    key={m._id}
                    className={`hover:bg-slate-50/60 transition-colors ${
                      isUser ? 'bg-indigo-50/30 font-medium' : ''
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">
                            {m.name} {isUser && '(You)'}
                          </p>
                          <p className="text-[11px] text-slate-400">{m.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4 font-semibold text-emerald-600">
                      {formatCurrency(m.depositsContributed, currency)}
                    </td>

                    <td className="px-4 py-4 font-semibold text-slate-700">
                      {formatCurrency(m.personalExpensesPaid, currency)}
                      {m.alreadyReimbursed > 0 && (
                        <span className="text-[10px] text-slate-400 block">
                          (₹{m.alreadyReimbursed.toLocaleString('en-IN')} already refunded)
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      {m.pendingReimbursementOwed > 0 ? (
                        <span className="font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-md inline-block">
                          Gets {formatCurrency(m.pendingReimbursementOwed, currency)}
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium">None pending</span>
                      )}
                    </td>

                    <td className="px-4 py-4 text-slate-500">
                      {formatCurrency(m.equalShare, currency)}
                    </td>

                    <td className="px-6 py-4 text-right">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${
                          m.netBalance > 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.netBalance < 0
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {m.netBalance > 0
                          ? `🎉 Gets ${formatCurrency(m.netBalance, currency)} leftover`
                          : m.netBalance < 0
                          ? `⚠️ Owes ${formatCurrency(Math.abs(m.netBalance), currency)}`
                          : '✅ Perfectly Settled'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shared Transactions Table (Expenditures & Pool Deposits) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-indigo-600" />
            <h3 className="text-base font-bold text-slate-900">
              Group Records ({filteredTransactions.length})
            </h3>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-2">
            <div className="flex p-0.5 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveTab('pending_refund')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'pending_refund'
                    ? 'bg-amber-500 text-white shadow-2xs font-bold'
                    : 'text-amber-700 hover:text-amber-900'
                }`}
              >
                Pending Refunds
              </button>
              <button
                onClick={() => setActiveTab('expense')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'expense'
                    ? 'bg-white text-rose-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Expenditures
              </button>
              <button
                onClick={() => setActiveTab('deposit')}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  activeTab === 'deposit'
                    ? 'bg-white text-emerald-600 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Bank Deposits
              </button>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No transactions found for this filter.
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredTransactions.map((tx) => {
              const isDeposit = tx.type === 'deposit';
              const isPersonal = (tx.paymentSource || 'personal') === 'personal';
              const isReimbursed = tx.isReimbursed;

              return (
                <div
                  key={tx._id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 hover:bg-slate-50/80 transition-colors gap-3"
                >
                  {/* Left: Title, Badges, Spender name */}
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5 ${
                        isDeposit
                          ? 'bg-emerald-50 text-emerald-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {isDeposit ? (
                        <ArrowUpRight className="w-5 h-5" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5" />
                      )}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {tx.title}
                        </p>

                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isDeposit
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {isDeposit ? 'Bank Deposit' : tx.category}
                        </span>

                        {!isDeposit && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isPersonal
                                ? 'bg-amber-100 text-amber-900 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {isPersonal ? 'Paid from Personal Pocket' : 'Paid from Common Bank'}
                          </span>
                        )}

                        {!isDeposit && isPersonal && (
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isReimbursed
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-200 text-amber-950 font-extrabold'
                            }`}
                          >
                            {isReimbursed ? '✅ Refunded from Bank' : '⏳ Pending Refund from Bank'}
                          </span>
                        )}
                      </div>

                      {/* Prominent Spent by / Contributed by mention */}
                      <div className="flex items-center gap-2 text-xs text-slate-600 mt-1 flex-wrap font-medium">
                        <span className="inline-flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded-md text-slate-800">
                          👤 {isDeposit ? 'Contributed by:' : 'Spent by:'}{' '}
                          <strong className="text-indigo-700">
                            {tx.paidBy?.name || 'Member'}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>{formatDate(tx.date)}</span>
                        {tx.addedBy?.name && (
                          <>
                            <span>•</span>
                            <span className="text-slate-400">
                              Recorded by {tx.addedBy.name}
                            </span>
                          </>
                        )}
                      </div>

                      {tx.notes && (
                        <p className="text-xs text-slate-400 mt-1 italic">
                          "{tx.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right side: Amount, Reimburse toggle, Edit/Delete */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-12 sm:pl-0">
                    <span
                      className={`text-base font-extrabold ${
                        isDeposit ? 'text-emerald-600' : 'text-slate-900'
                      }`}
                    >
                      {isDeposit ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                    </span>

                    {/* Quick Reimbursement Toggle Button if Personal Expense */}
                    {!isDeposit && isPersonal && (
                      <button
                        onClick={() => handleToggleReimburse(tx._id, tx.title)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                          isReimbursed
                            ? 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                            : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100 shadow-2xs'
                        }`}
                        title="Toggle whether common bank has refunded this expense to the member"
                      >
                        {isReimbursed ? 'Undo Refund' : 'Mark Refunded'}
                      </button>
                    )}

                    {/* Member Edit/Delete Actions */}
                    <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditModal(tx)}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg cursor-pointer"
                        title="Edit entry"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTransaction(tx._id, tx.title)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Add / Edit Group Transaction (Expenditure OR Bank Pool Deposit) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-800">
                {modalMode === 'edit'
                  ? 'Edit Group Entry'
                  : formData.type === 'deposit'
                  ? 'Deposit Money to Common Bank Pool'
                  : 'Add Flat Expenditure'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="p-6 space-y-4">
              {/* Type Toggle: Expenditure vs Deposit */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      type: 'expense',
                      category:
                        prev.category === 'Group Pool Fund'
                          ? 'Food & Dining'
                          : prev.category,
                    }))
                  }
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    formData.type === 'expense'
                      ? 'bg-rose-500 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Expenditure (Kharcha)
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      type: 'deposit',
                      category: 'Group Pool Fund',
                    }))
                  }
                  className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    formData.type === 'deposit'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Deposit to Bank Pool
                </button>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  {formData.type === 'deposit'
                    ? 'Contribution Description *'
                    : 'Expense Title *'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={
                    formData.type === 'deposit'
                      ? 'e.g. October Flat Deposit - ₹5,000'
                      : 'e.g. Supermarket Groceries, Milk & Bread, Wifi Bill'
                  }
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              {/* If Expense: Choose Payment Source (Personal vs Common Bank) */}
              {formData.type === 'expense' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    How was this paid? *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, paymentSource: 'personal' })
                      }
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        formData.paymentSource === 'personal'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block font-bold">💳 Personal Pocket</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Common bank will refund this amount
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, paymentSource: 'common_bank' })
                      }
                      className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer ${
                        formData.paymentSource === 'common_bank'
                          ? 'border-indigo-600 bg-indigo-50/70 text-indigo-900 font-bold'
                          : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block font-bold">🏦 Common Bank Card/UPI</span>
                      <span className="text-[10px] text-slate-500 block mt-0.5">
                        Direct debit from shared bank
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Amount and Category Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Amount ({currency}) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0.01"
                    required
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 cursor-pointer"
                  >
                    {GROUP_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Who Paid / Contributed Dropdown */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  {formData.type === 'deposit'
                    ? 'Who Deposited This Money? *'
                    : formData.paymentSource === 'personal'
                    ? 'Who Paid Out of Their Personal Pocket? (Gets Refund) *'
                    : 'Who Authorized / Spent This from Bank? *'}
                </label>
                <select
                  value={formData.paidBy}
                  onChange={(e) =>
                    setFormData({ ...formData, paidBy: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 font-semibold cursor-pointer"
                >
                  {group.members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Receipt note, store name, or UPI reference..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 resize-none"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2.5 text-xs font-semibold text-white rounded-xl shadow-sm disabled:opacity-50 cursor-pointer ${
                    formData.type === 'deposit'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  {submitting
                    ? 'Saving...'
                    : modalMode === 'edit'
                    ? 'Update Entry'
                    : formData.type === 'deposit'
                    ? 'Add Deposit to Bank'
                    : 'Save Flat Expenditure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupDetailsPage;
