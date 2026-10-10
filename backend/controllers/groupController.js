const Group = require('../models/Group');
const GroupTransaction = require('../models/GroupTransaction');
const { GROUP_CATEGORIES } = require('../models/GroupTransaction');
const crypto = require('crypto');

// Generate unique invite code
const generateInviteCode = () => {
  return 'GRP-' + crypto.randomBytes(3).toString('hex').toUpperCase();
};

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Group name is required',
      });
    }

    let inviteCode = generateInviteCode();
    // Ensure uniqueness
    let exists = await Group.findOne({ inviteCode });
    while (exists) {
      inviteCode = generateInviteCode();
      exists = await Group.findOne({ inviteCode });
    }

    const group = await Group.create({
      name: name.trim(),
      description: description ? description.trim() : '',
      admin: req.user._id,
      members: [req.user._id], // Creator is automatically first approved member
      pendingRequests: [],
      inviteCode,
      currency: req.user.currency || '₹',
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('admin', 'name email')
      .populate('members', 'name email');

    res.status(201).json({
      success: true,
      data: populatedGroup,
      message: `Group "${group.name}" created successfully! Invite code: ${inviteCode}`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all groups for current user (member or pending)
// @route   GET /api/groups
// @access  Private
const getMyGroups = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Groups where user is member OR admin OR has requested to join
    const groups = await Group.find({
      $or: [
        { members: userId },
        { admin: userId },
        { pendingRequests: userId },
      ],
    })
      .populate('admin', 'name email')
      .populate('members', 'name email')
      .populate('pendingRequests', 'name email')
      .sort({ updatedAt: -1 });

    // Attach group spending & deposit totals
    const groupsWithStats = await Promise.all(
      groups.map(async (grp) => {
        const transactions = await GroupTransaction.find({ group: grp._id });
        const totalExpenses = transactions
          .filter((tx) => (tx.type || 'expense') === 'expense')
          .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

        const totalDeposits = transactions
          .filter((tx) => tx.type === 'deposit')
          .reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

        const isUserApproved = grp.members.some(
          (m) => m._id.toString() === userId.toString()
        );
        const isUserPending = grp.pendingRequests.some(
          (p) => p._id.toString() === userId.toString()
        );
        const isUserAdmin = grp.admin._id.toString() === userId.toString();

        return {
          ...grp.toObject(),
          totalSpend: totalExpenses,
          totalExpenses,
          totalDeposits,
          poolBalance: totalDeposits - totalExpenses,
          transactionCount: transactions.length,
          isUserApproved,
          isUserPending,
          isUserAdmin,
        };
      })
    );

    res.json({
      success: true,
      count: groupsWithStats.length,
      data: groupsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group details, transparent settlement & breakdown
// @route   GET /api/groups/:id
// @access  Private
const getGroupById = async (req, res, next) => {
  try {
    const userId = req.user._id.toString();
    const group = await Group.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email')
      .populate('pendingRequests', 'name email');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    const isMember = group.members.some((m) => m._id.toString() === userId);
    const isPending = group.pendingRequests.some(
      (p) => p._id.toString() === userId
    );
    const isAdmin = group.admin._id.toString() === userId;

    if (!isMember && !isPending && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this group.',
      });
    }

    // Fetch all transactions for this group
    const transactions = await GroupTransaction.find({ group: group._id })
      .populate('paidBy', 'name email')
      .populate('addedBy', 'name email')
      .sort({ date: -1, createdAt: -1 });

    let totalDeposited = 0;
    let totalExpenses = 0;
    let directExpensesFromBank = 0;
    let personalExpenses = 0;
    let reimbursedAmount = 0;
    let pendingReimbursementAmount = 0;

    // Track per-member data
    const memberStats = {};
    group.members.forEach((member) => {
      memberStats[member._id.toString()] = {
        _id: member._id,
        name: member.name,
        email: member.email,
        depositsContributed: 0,
        personalExpensesPaid: 0,
        pendingReimbursementOwed: 0,
        alreadyReimbursed: 0,
        expenseCount: 0,
        depositCount: 0,
      };
    });

    const pendingReimbursementsList = [];

    transactions.forEach((tx) => {
      const payerId = tx.paidBy?._id?.toString() || tx.paidBy?.toString();
      const amount = Number(tx.amount || 0);
      const isDeposit = tx.type === 'deposit';
      const isPersonal = (tx.paymentSource || 'personal') === 'personal';
      const isReimbursed = !!tx.isReimbursed;

      if (isDeposit) {
        totalDeposited += amount;
        if (memberStats[payerId]) {
          memberStats[payerId].depositsContributed += amount;
          memberStats[payerId].depositCount += 1;
        }
      } else {
        totalExpenses += amount;
        if (isPersonal) {
          personalExpenses += amount;
          if (isReimbursed) {
            reimbursedAmount += amount;
            if (memberStats[payerId]) {
              memberStats[payerId].alreadyReimbursed += amount;
              memberStats[payerId].personalExpensesPaid += amount;
              memberStats[payerId].expenseCount += 1;
            }
          } else {
            pendingReimbursementAmount += amount;
            if (memberStats[payerId]) {
              memberStats[payerId].pendingReimbursementOwed += amount;
              memberStats[payerId].personalExpensesPaid += amount;
              memberStats[payerId].expenseCount += 1;
            }
            // Add to pending reimbursement claims list
            pendingReimbursementsList.push({
              _id: tx._id,
              title: tx.title,
              amount: tx.amount,
              date: tx.date,
              paidById: tx.paidBy?._id,
              paidByName: tx.paidBy?.name || 'Member',
              category: tx.category,
              notes: tx.notes,
              instruction: `${tx.paidBy?.name || 'Member'} should receive ₹${Number(tx.amount).toLocaleString('en-IN')} back from Common Bank Account`,
            });
          }
        } else {
          directExpensesFromBank += amount;
        }
      }
    });

    const memberCount = group.members.length || 1;
    const equalShare = totalExpenses > 0 ? totalExpenses / memberCount : 0;

    // Common Bank Account Math:
    // Current cash balance in common bank account right now:
    const currentBankBalance = totalDeposited - directExpensesFromBank - reimbursedAmount;
    // Bank balance remaining after paying all pending roommate refunds:
    const netBankBalanceAfterRefunds = currentBankBalance - pendingReimbursementAmount;

    // Per member settlement:
    // For each roommate:
    // How much did they put in? Their deposits into bank ($D_M$).
    // How much did they expend from their own pocket that hasn't been refunded yet? ($E_{pending}$).
    // Fair share of flat expenses: $S_{fair}$.
    // Total refund they are owed from Common Bank = pendingReimbursementOwed + (depositsContributed - equalShare)
    const settlements = Object.values(memberStats).map((m) => {
      // Net position against common bank:
      // What member paid out of pocket + deposited vs what their equal share is
      const netTotalContribution = m.depositsContributed + m.pendingReimbursementOwed;
      const netBalance = Math.round(netTotalContribution - equalShare);
      const leftoverPoolShare = Math.round(m.depositsContributed - equalShare);

      return {
        ...m,
        equalShare: Math.round(equalShare),
        netBalance,
        leftoverPoolShare,
        totalRefundDue: m.pendingReimbursementOwed + (leftoverPoolShare > 0 ? leftoverPoolShare : 0),
        status:
          netBalance > 0
            ? 'gets_refund'
            : netBalance < 0
            ? 'owes'
            : 'settled',
        statusLabel:
          m.pendingReimbursementOwed > 0
            ? `Gets ₹${m.pendingReimbursementOwed.toLocaleString('en-IN')} refund from Common Bank`
            : netBalance > 0
            ? `Gets ₹${netBalance.toLocaleString('en-IN')} leftover refund`
            : netBalance < 0
            ? `Owes ₹${Math.abs(netBalance).toLocaleString('en-IN')} to Common Bank`
            : 'All Settled',
      };
    });

    // Pairwise settlement plan
    const debtors = settlements
      .filter((s) => s.netBalance < 0)
      .map((s) => ({ ...s, remainingDebt: Math.abs(s.netBalance) }))
      .sort((a, b) => b.remainingDebt - a.remainingDebt);

    const creditors = settlements
      .filter((s) => s.netBalance > 0)
      .map((s) => ({ ...s, remainingCredit: s.netBalance }))
      .sort((a, b) => b.remainingCredit - a.remainingCredit);

    const settlementPlan = [];
    let d = 0;
    let c = 0;

    while (d < debtors.length && c < creditors.length) {
      const debtor = debtors[d];
      const creditor = creditors[c];
      const transferAmount = Math.min(
        debtor.remainingDebt,
        creditor.remainingCredit
      );

      if (transferAmount > 0) {
        settlementPlan.push({
          fromId: debtor._id,
          fromName: debtor.name,
          toId: creditor._id,
          toName: creditor.name,
          amount: Math.round(transferAmount),
          instruction: `${debtor.name} pays ₹${Math.round(
            transferAmount
          ).toLocaleString('en-IN')} to ${creditor.name} (gets money back)`,
        });
      }

      debtor.remainingDebt -= transferAmount;
      creditor.remainingCredit -= transferAmount;

      if (debtor.remainingDebt <= 0) d++;
      if (creditor.remainingCredit <= 0) c++;
    }

    res.json({
      success: true,
      data: {
        group: {
          ...group.toObject(),
          isUserApproved: isMember,
          isUserPending: isPending,
          isUserAdmin: isAdmin,
        },
        transactions,
        summary: {
          commonBank: {
            totalDeposited,
            totalExpenses,
            directExpensesFromBank,
            personalExpenses,
            reimbursedAmount,
            pendingReimbursementAmount,
            currentBankBalance,
            netBankBalanceAfterRefunds,
          },
          totalSpend: totalExpenses,
          totalExpenses,
          totalDeposits: totalDeposited,
          poolBalance: netBankBalanceAfterRefunds,
          transactionCount: transactions.length,
          memberCount,
          equalSharePerMember: Math.round(equalShare),
          pendingReimbursementsList,
          settlements,
          settlementPlan,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Request to join a group using Invite Code
// @route   POST /api/groups/join
// @access  Private
const joinGroupByCode = async (req, res, next) => {
  try {
    const { inviteCode } = req.body;
    const userId = req.user._id;

    if (!inviteCode || !inviteCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid group invite code',
      });
    }

    const group = await Group.findOne({
      inviteCode: inviteCode.trim().toUpperCase(),
    });

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'No group found with this invite code. Please check and try again.',
      });
    }

    // Check if already member
    if (group.members.some((m) => m.toString() === userId.toString())) {
      return res.status(400).json({
        success: false,
        message: `You are already an approved member of "${group.name}".`,
      });
    }

    // Check if already in pending requests
    if (
      group.pendingRequests.some((p) => p.toString() === userId.toString())
    ) {
      return res.status(400).json({
        success: false,
        message: `Your request to join "${group.name}" is already pending admin approval.`,
      });
    }

    // Add to pending requests
    group.pendingRequests.push(userId);
    await group.save();

    res.json({
      success: true,
      message: `Join request sent for "${group.name}"! The group admin will review and approve your request.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin approves pending join request
// @route   PUT /api/groups/:id/requests/:userId/approve
// @access  Private (Admin only)
const approveJoinRequest = async (req, res, next) => {
  try {
    const { id: groupId, userId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Only Admin can approve
    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the group admin can approve join requests.',
      });
    }

    // Remove from pendingRequests
    group.pendingRequests = group.pendingRequests.filter(
      (p) => p.toString() !== userId.toString()
    );

    // Add to members if not already there
    if (!group.members.some((m) => m.toString() === userId.toString())) {
      group.members.push(userId);
    }

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate('admin', 'name email')
      .populate('members', 'name email')
      .populate('pendingRequests', 'name email');

    res.json({
      success: true,
      data: updatedGroup,
      message: 'Member approved and granted access to the group!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin rejects pending join request
// @route   PUT /api/groups/:id/requests/:userId/reject
// @access  Private (Admin only)
const rejectJoinRequest = async (req, res, next) => {
  try {
    const { id: groupId, userId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the group admin can reject join requests.',
      });
    }

    group.pendingRequests = group.pendingRequests.filter(
      (p) => p.toString() !== userId.toString()
    );
    await group.save();

    res.json({
      success: true,
      message: 'Join request rejected.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member or leave group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private
const removeMember = async (req, res, next) => {
  try {
    const { id: groupId, userId } = req.params;
    const currentUserId = req.user._id.toString();

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    const isAdmin = group.admin.toString() === currentUserId;
    const isSelfLeaving = currentUserId === userId.toString();

    if (!isAdmin && !isSelfLeaving) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this member.',
      });
    }

    // If admin is leaving and there are other members, assign first member as new admin
    if (isAdmin && isSelfLeaving) {
      const remainingMembers = group.members.filter(
        (m) => m.toString() !== userId.toString()
      );
      if (remainingMembers.length > 0) {
        group.admin = remainingMembers[0];
      }
    }

    group.members = group.members.filter(
      (m) => m.toString() !== userId.toString()
    );
    await group.save();

    res.json({
      success: true,
      message: isSelfLeaving
        ? 'You have left the group.'
        : 'Member removed from the group.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete group (Admin only)
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    if (group.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only group admin can delete the entire group.',
      });
    }

    // Delete all transactions of this group
    await GroupTransaction.deleteMany({ group: group._id });
    await Group.findByIdAndDelete(group._id);

    res.json({
      success: true,
      message: `Group "${group.name}" and its transactions have been deleted.`,
    });
  } catch (error) {
    next(error);
  }
};

// ==========================================
// GROUP TRANSACTIONS CRUD (All approved members)
// ==========================================

// @desc    Add transaction to group (Expenditure or Deposit/Pool Fund)
// @route   POST /api/groups/:id/transactions
// @access  Private (Approved member only)
const addGroupTransaction = async (req, res, next) => {
  try {
    const { id: groupId } = req.params;
    const {
      title,
      amount,
      type = 'expense',
      paymentSource = 'personal',
      category,
      paidBy,
      date,
      notes,
    } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check if user is an approved member
    const isMember = group.members.some(
      (m) => m.toString() === req.user._id.toString()
    );
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Only approved group members can add transactions.',
      });
    }

    if (!title || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title and amount',
      });
    }

    const txType = type === 'deposit' ? 'deposit' : 'expense';

    const transaction = await GroupTransaction.create({
      group: group._id,
      title: title.trim(),
      amount: Math.abs(Number(amount)),
      type: txType,
      paymentSource: txType === 'deposit' ? 'personal' : (paymentSource || 'personal'),
      isReimbursed: false,
      category:
        category || (txType === 'deposit' ? 'Group Pool Fund' : 'Food & Dining'),
      paidBy: paidBy || req.user._id,
      addedBy: req.user._id,
      date: date ? new Date(date) : new Date(),
      notes: notes ? notes.trim() : '',
    });

    const populatedTx = await GroupTransaction.findById(transaction._id)
      .populate('paidBy', 'name email')
      .populate('addedBy', 'name email');

    res.status(201).json({
      success: true,
      data: populatedTx,
      message:
        txType === 'deposit'
          ? `₹${transaction.amount} contributed to Group Pool!`
          : `Group expenditure of ₹${transaction.amount} recorded!`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update group transaction
// @route   PUT /api/groups/:id/transactions/:txId
// @access  Private (Approved members)
const updateGroupTransaction = async (req, res, next) => {
  try {
    const { id: groupId, txId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check approved member
    if (!group.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Only approved members can edit group transactions.',
      });
    }

    const transaction = await GroupTransaction.findOne({
      _id: txId,
      group: groupId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Group transaction not found',
      });
    }

    const { title, amount, type, paymentSource, category, paidBy, date, notes } = req.body;
    if (title) transaction.title = title.trim();
    if (amount !== undefined) transaction.amount = Math.abs(Number(amount));
    if (type) transaction.type = type;
    if (paymentSource) transaction.paymentSource = paymentSource;
    if (category) transaction.category = category;
    if (paidBy) transaction.paidBy = paidBy;
    if (date) transaction.date = new Date(date);
    if (notes !== undefined) transaction.notes = notes.trim();

    await transaction.save();

    const updatedTx = await GroupTransaction.findById(transaction._id)
      .populate('paidBy', 'name email')
      .populate('addedBy', 'name email');

    res.json({
      success: true,
      data: updatedTx,
      message: 'Group transaction updated successfully!',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle reimbursement status of a personal group expense from Common Bank
// @route   PUT /api/groups/:id/transactions/:txId/reimburse
// @access  Private (Approved members)
const toggleReimbursement = async (req, res, next) => {
  try {
    const { id: groupId, txId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    if (!group.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const transaction = await GroupTransaction.findOne({ _id: txId, group: groupId });
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }

    transaction.isReimbursed = !transaction.isReimbursed;
    transaction.reimbursedAt = transaction.isReimbursed ? new Date() : null;
    await transaction.save();

    const updatedTx = await GroupTransaction.findById(transaction._id)
      .populate('paidBy', 'name email')
      .populate('addedBy', 'name email');

    res.json({
      success: true,
      data: updatedTx,
      message: transaction.isReimbursed
        ? `Reimbursed from Common Bank!`
        : `Marked as pending reimbursement from Common Bank.`,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete group transaction
// @route   DELETE /api/groups/:id/transactions/:txId
// @access  Private (Approved members)
const deleteGroupTransaction = async (req, res, next) => {
  try {
    const { id: groupId, txId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found',
      });
    }

    // Check member
    if (!group.members.some((m) => m.toString() === req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Only approved members can delete group transactions.',
      });
    }

    const deleted = await GroupTransaction.findOneAndDelete({
      _id: txId,
      group: groupId,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Group transaction not found',
      });
    }

    res.json({
      success: true,
      data: {},
      message: 'Group transaction deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group metadata categories
// @route   GET /api/groups/meta
// @access  Public
const getGroupMeta = (req, res) => {
  res.json({
    success: true,
    data: {
      categories: GROUP_CATEGORIES,
    },
  });
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupById,
  joinGroupByCode,
  approveJoinRequest,
  rejectJoinRequest,
  removeMember,
  deleteGroup,
  addGroupTransaction,
  updateGroupTransaction,
  deleteGroupTransaction,
  toggleReimbursement,
  getGroupMeta,
};
