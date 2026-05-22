import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, publicUser } from '../utils/http.js';
import { postDto } from '../services/normalize.js';
import { notify } from '../services/notify.js';

const router = Router();
router.use(requireAdmin);

router.get('/stats', asyncHandler(async (req, res) => {
  const [users, items, openReports, returnedItems, pendingClaims] = await Promise.all([
    req.models.User.countDocuments({ status: 'active' }),
    req.models.Post.countDocuments({ status: { $ne: 'removed' } }),
    req.models.Report.countDocuments({ status: 'open' }),
    req.models.Post.countDocuments({ status: 'returned' }),
    req.models.Claim.countDocuments({ status: 'pending' })
  ]);
  return ok(res, { stats: { users, items, open_reports: openReports, returned_items: returnedItems, pending_claims: pendingClaims } });
}));

router.get('/users', asyncHandler(async (req, res) => {
  const users = await req.models.User.find().sort({ createdAt: -1 }).limit(100);
  return ok(res, { users: users.map(publicUser) });
}));

router.patch('/users/:id', asyncHandler(async (req, res) => {
  const status = ['active', 'suspended', 'banned'].includes(req.body.status) ? req.body.status : undefined;
  const role = ['user', 'admin'].includes(req.body.role) ? req.body.role : undefined;
  const user = await req.models.User.findByIdAndUpdate(req.params.id, { ...(status && { status }), ...(role && { role }) }, { new: true });
  return ok(res, { user: publicUser(user), message: 'User updated.' });
}));

router.get('/items', asyncHandler(async (req, res) => {
  const items = await req.models.Post.find({ status: { $ne: 'removed' } }).populate('user', 'fullName username').sort({ createdAt: -1 }).limit(100);
  return ok(res, { items: items.map(postDto) });
}));

router.patch('/items/:id/remove', asyncHandler(async (req, res) => {
  await req.models.Post.findByIdAndUpdate(req.params.id, { status: 'removed' });
  await req.models.AdminLog.create({ admin: req.user._id, action: 'remove_item', entityType: 'Post', entityId: req.params.id });
  return ok(res, { message: 'Item removed.' });
}));

router.get('/claims', asyncHandler(async (req, res) => {
  const claims = await req.models.Claim.find().populate('post', 'title user').sort({ createdAt: -1 }).limit(100);
  return ok(res, { claims });
}));

router.patch('/claims/:id', asyncHandler(async (req, res) => {
  const status = ['approved', 'rejected', 'pending'].includes(req.body.status) ? req.body.status : 'pending';
  const claim = await req.models.Claim.findByIdAndUpdate(req.params.id, { status, reviewedBy: req.user._id, reviewedAt: new Date() }, { new: true }).populate('post');
  if (claim?.claimant) await notify(claim.claimant, 'Claim update', `Your claim was ${status}.`, `Post Details.html?id=${claim.post?._id}`, req.io);
  return ok(res, { claim, message: 'Claim updated.' });
}));

router.get('/reports', asyncHandler(async (req, res) => {
  const reports = await req.models.Report.find().populate('post', 'title').populate('reporter', 'fullName email').sort({ createdAt: -1 }).limit(100);
  return ok(res, { reports });
}));

export default router;
