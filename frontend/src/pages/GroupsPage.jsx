import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatters';
import toast from 'react-hot-toast';
import {
  Users,
  Plus,
  KeyRound,
  ShieldCheck,
  Clock,
  ArrowRight,
  Copy,
  Check,
  X,
  UserCheck,
} from 'lucide-react';

const GroupsPage = () => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isJoinOpen, setIsJoinOpen] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Form states
  const [createForm, setCreateForm] = useState({ name: '', description: '' });
  const [inviteCodeInput, setInviteCodeInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await api.get('/groups');
      if (res.data.success) {
        setGroups(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching groups:', err);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!createForm.name.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/groups', createForm);
      if (res.data.success) {
        toast.success(res.data.message || 'Group created successfully!');
        setIsCreateOpen(false);
        setCreateForm({ name: '', description: '' });
        fetchGroups();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    if (!inviteCodeInput.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post('/groups/join', {
        inviteCode: inviteCodeInput.trim().toUpperCase(),
      });
      if (res.data.success) {
        toast.success(res.data.message || 'Join request submitted!');
        setIsJoinOpen(false);
        setInviteCodeInput('');
        fetchGroups();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to join group');
    } finally {
      setSubmitting(false);
    }
  };

  const copyInviteCode = (code, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Invite code ${code} copied! Share it with friends.`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              Shared Group Expenses
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 rounded-full">
              {groups.length} groups
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track group trips, roommate bills, and transparent splits with admin join approvals.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsJoinOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs sm:text-sm border border-slate-200 dark:border-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <KeyRound className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Join with Code</span>
          </button>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-all shadow-xs shadow-indigo-600/30 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Group</span>
          </button>
        </div>
      </div>

      {/* Groups Grid */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-12 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col items-center justify-center transition-colors">
          <div className="w-8 h-8 border-4 border-indigo-200 dark:border-indigo-900 border-t-indigo-600 rounded-full animate-spin mb-3" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading your groups...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200/80 dark:border-slate-800 shadow-xs text-center max-w-xl mx-auto transition-colors">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">No Groups Yet</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 mb-6 max-w-sm mx-auto">
            Create a group for your next trip or flatmates, or ask an existing group admin for their invite code.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setIsCreateOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              + Create a Group
            </button>
            <button
              onClick={() => setIsJoinOpen(true)}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Enter Invite Code
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {groups.map((group) => {
            const isApproved = group.isUserApproved;
            const isPending = group.isUserPending;
            const isAdmin = group.isUserAdmin;
            const pendingCount = group.pendingRequests?.length || 0;

            return (
              <div
                key={group._id}
                onClick={() => isApproved && navigate(`/groups/${group._id}`)}
                className={`group relative bg-white dark:bg-slate-900 rounded-2xl border p-6 shadow-xs transition-all duration-200 flex flex-col justify-between ${
                  isApproved
                    ? 'border-slate-200/80 dark:border-slate-800 hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-500/50 cursor-pointer'
                    : 'opacity-90 border-amber-200 dark:border-amber-800/60 bg-amber-50/20 dark:bg-amber-950/20'
                }`}
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                          <ShieldCheck className="w-3 h-3" /> Admin
                        </span>
                      )}
                      {isApproved && !isAdmin && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <UserCheck className="w-3 h-3" /> Member
                        </span>
                      )}
                      {isPending && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          <Clock className="w-3 h-3" /> Pending Approval
                        </span>
                      )}
                    </div>

                    {/* Admin pending requests notification pill */}
                    {isAdmin && pendingCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white animate-pulse">
                        {pendingCount} request{pendingCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {group.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 min-h-[32px]">
                    {group.description || 'No description provided.'}
                  </p>

                  {/* Pending Notice if user is waiting */}
                  {isPending && (
                    <div className="mt-3 p-2.5 bg-amber-100/70 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 rounded-xl text-xs font-medium">
                      ⏳ Your join request is pending approval from admin ({group.admin?.name || 'Admin'}).
                    </div>
                  )}

                  {/* Metrics Box */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Total Spend</span>
                      <span className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                        {formatCurrency(group.totalSpend, group.currency || '₹')}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 dark:text-slate-500 block">Members</span>
                      <span className="text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5 block">
                        {group.members?.length || 1} people
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Invite Code & Action */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={(e) => copyInviteCode(group.inviteCode, e)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-xs font-mono font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                    title="Click to copy invite code"
                  >
                    {copiedCode === group.inviteCode ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                    )}
                    <span>{group.inviteCode}</span>
                  </button>

                  {isApproved ? (
                    <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Dashboard <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                      Awaiting Access
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Group */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Create New Group
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goa Trip 2026, Flat 402 Roommates"
                  value={createForm.name}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Description / Purpose (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="Shared expenses for accommodation, food, tickets..."
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm({ ...createForm, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 resize-none"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 dark:bg-indigo-950/50 rounded-xl text-xs text-indigo-800 dark:text-indigo-300 font-medium">
                💡 You will be the <strong>Admin</strong> of this group. You will get a unique Invite Code to share, and only members you approve will be able to join!
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Join Group with Invite Code */}
      {isJoinOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-800 dark:text-slate-100">
                  Join a Group
                </h3>
              </div>
              <button
                onClick={() => setIsJoinOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleJoinGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Group Invite Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GRP-A1B2C"
                  value={inviteCodeInput}
                  onChange={(e) =>
                    setInviteCodeInput(e.target.value.toUpperCase())
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-xl text-base font-mono font-bold tracking-wider focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100 uppercase"
                />
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 font-medium">
                🔒 <strong>Security &amp; Transparency:</strong> After submitting, your join request will be sent to the group Admin. Once approved, you can view all transactions and add/edit group expenses.
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsJoinOpen(false)}
                  className="px-4 py-2.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? 'Sending Request...' : 'Request to Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
