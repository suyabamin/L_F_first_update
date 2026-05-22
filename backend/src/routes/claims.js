import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/http.js';
import { notify } from '../services/notify.js';

const router = Router();

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const f = req.body;
  const postId = f.item_id || f.post_id;
  if (!postId || !f.fullName || !f.email || !f.phone || !f.proofDetails) {
    return res.status(422).json({ success: false, message: 'Please fill required claim information.' });
  }
  const post = await req.models.Post.findById(postId);
  if (!post) return res.status(404).json({ success: false, message: 'Item not found.' });
  const claim = await req.models.Claim.create({
    post: post._id,
    claimant: req.user._id,
    fullName: f.fullName,
    email: f.email,
    phone: f.phone,
    nidOrPassport: f.nid,
    proofDetails: f.proofDetails,
    additionalInfo: f.additionalInfo
  });
  await notify(post.user, 'New claim on your item', `Someone submitted a claim for "${post.title}".`, `Post Details.html?id=${post._id}`, req.io);
  return created(res, { id: String(claim._id), redirect: `Post Details.html?id=${post._id}`, message: 'Claim submitted successfully.' });
}));

router.get('/mine', requireAuth, asyncHandler(async (req, res) => {
  const claims = await req.models.Claim.find({ claimant: req.user._id }).populate('post', 'title itemType').sort({ createdAt: -1 });
  return ok(res, { claims });
}));

export default router;
