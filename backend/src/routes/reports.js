import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created } from '../utils/http.js';

const router = Router();

router.post('/', asyncHandler(async (req, res) => {
  if (!req.body.reason && !req.body.message) return res.status(422).json({ success: false, message: 'Reason is required.' });
  const report = await req.models.Report.create({
    reporter: req.user?._id,
    post: req.body.item_id || req.body.post_id || undefined,
    reason: req.body.reason || 'User Feedback',
    details: req.body.details || req.body.message
  });
  return created(res, { id: String(report._id), message: 'Report submitted. Our team will review it.' });
}));

export default router;
