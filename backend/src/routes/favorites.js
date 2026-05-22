import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok } from '../utils/http.js';
import { postDto } from '../services/normalize.js';

const router = Router();

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const rows = await req.models.Favorite.find({ user: req.user._id }).populate({ path: 'post', populate: { path: 'user', select: 'fullName username' } }).sort({ createdAt: -1 });
  return ok(res, { favorites: rows.filter((r) => r.post).map((r) => postDto(r.post)) });
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const post = req.body.item_id || req.body.post_id || req.body.post;
  if (!post) return res.status(400).json({ success: false, message: 'item_id required' });
  const existing = await req.models.Favorite.findOne({ user: req.user._id, post });
  if (existing) {
    await existing.deleteOne();
    return ok(res, { favorited: false });
  }
  await req.models.Favorite.create({ user: req.user._id, post });
  return ok(res, { favorited: true });
}));

export default router;
