import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/http.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const rows = await req.models.Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
  return ok(res, {
    notifications: rows.map((n) => ({
      id: String(n._id),
      title: n.title,
      description: n.body,
      type: n.type,
      actionLink: n.linkUrl || '#',
      actionText: 'Open',
      read: n.isRead,
      createdAt: n.createdAt
    }))
  });
}));

router.post('/read', requireAuth, asyncHandler(async (req, res) => {
  if (req.body.all) await req.models.Notification.updateMany({ user: req.user._id }, { isRead: true });
  else if (req.body.id) await req.models.Notification.updateOne({ _id: req.body.id, user: req.user._id }, { isRead: true });
  return ok(res);
}));

export default router;
