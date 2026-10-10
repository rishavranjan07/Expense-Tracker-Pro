const express = require('express');
const router = express.Router();
const {
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
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.get('/meta', getGroupMeta);

// Protected routes
router.use(protect);

router.route('/').post(createGroup).get(getMyGroups);
router.post('/join', joinGroupByCode);

router.route('/:id').get(getGroupById).delete(deleteGroup);
router.put('/:id/requests/:userId/approve', approveJoinRequest);
router.put('/:id/requests/:userId/reject', rejectJoinRequest);
router.delete('/:id/members/:userId', removeMember);

// Group Transactions
router.post('/:id/transactions', addGroupTransaction);
router
  .route('/:id/transactions/:txId')
  .put(updateGroupTransaction)
  .delete(deleteGroupTransaction);
router.put('/:id/transactions/:txId/reimburse', toggleReimbursement);

module.exports = router;
