import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok } from '../utils/http.js';
import { normalizeCategory, postDto } from '../services/normalize.js';
import { notify } from '../services/notify.js';
import { env } from '../config/env.js';

const router = Router();
const itemDir = path.join(env.uploadDir, 'items');
fs.mkdirSync(itemDir, { recursive: true });
const storage = multer.diskStorage({
  destination: itemDir,
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    cb(null, /^image\/(png|jpe?g|webp|gif|svg\+xml)$/.test(file.mimetype));
  }
});

router.get('/', asyncHandler(async (req, res) => {
  const filter = { status: { $ne: 'removed' } };
  if (['lost', 'found'].includes(req.query.type)) filter.itemType = req.query.type;
  if (req.query.status && req.query.status !== 'all') filter.status = req.query.status;
  if (req.query.category) filter.category = normalizeCategory(req.query.category);
  if (req.query.q) filter.$text = { $search: req.query.q };

  const posts = await req.models.Post.find(filter).populate('user', 'fullName username').sort({ createdAt: -1 }).limit(100);
  return res.json(posts.map((post) => postDto(post)));
}));

router.post('/', requireAuth, upload.array('images', 5), asyncHandler(async (req, res) => {
  const f = req.body;
  const title = f.title;
  const description = f.description || f.desc;
  const itemType = f.item_type || f.status || f.type || 'lost';
  const locationName = f.location || f.location_name;
  if (!title || !description || !locationName || !['lost', 'found'].includes(itemType)) {
    return res.status(422).json({ success: false, message: 'Please fill all required post fields.' });
  }
  const post = await req.models.Post.create({
    user: req.user._id,
    title,
    description,
    itemType,
    category: normalizeCategory(f.category),
    locationName,
    coordinates: { lat: Number(f.latitude || f.lat) || undefined, lng: Number(f.longitude || f.lng) || undefined },
    dateOccurred: f.date_occurred || f.date || undefined,
    publicContact: f.contact || f.public_contact,
    rewardAmount: Number(f.reward_amount || 0),
    images: (req.files || []).map((file, index) => ({
      path: `/uploads/items/${file.filename}`,
      isPrimary: index === 0,
      alt: title
    }))
  });
  await notify(req.user._id, 'Post published', `Your listing "${title}" is now live.`, `Post Details.html?id=${post._id}`, req.io);
  return created(res, { id: String(post._id), post: postDto(await post.populate('user', 'fullName username')), redirect: `Post Details.html?id=${post._id}`, message: 'Post created.' });
}));

router.get('/dashboard/recent', asyncHandler(async (req, res) => {
  const posts = await req.models.Post.find({ status: { $ne: 'removed' } }).populate('user', 'fullName username').sort({ createdAt: -1 }).limit(24);
  return ok(res, { posts: posts.map((post) => ({ ...postDto(post), status: post.itemType, time: new Date(post.createdAt).toLocaleDateString() })) });
}));

router.get('/stats/categories', asyncHandler(async (req, res) => {
  const rows = await req.models.Post.aggregate([
    { $match: { status: { $ne: 'removed' } } },
    { $group: { _id: '$category', total: { $sum: 1 } } }
  ]);
  const counts = { electronics: 0, pets: 0, bag: 0, key: 0, paper: 0, jewelry: 0, others: 0 };
  rows.forEach((row) => { counts[row._id] = row.total; });
  return ok(res, { counts });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const post = await req.models.Post.findOne({ _id: req.params.id, status: { $ne: 'removed' } }).populate('user', 'fullName username');
  if (!post) return res.status(404).json({ success: false, message: 'Item not found.' });
  post.viewCount += 1;
  await post.save();
  const opposite = post.itemType === 'lost' ? 'found' : 'lost';
  const matches = await req.models.Post.find({
    _id: { $ne: post._id },
    itemType: opposite,
    status: 'open',
    $or: [{ category: post.category }, { locationName: new RegExp(post.locationName.split(',')[0], 'i') }]
  }).limit(10).populate('user', 'fullName username');
  let isFavorite = false;
  if (req.user) isFavorite = !!(await req.models.Favorite.findOne({ user: req.user._id, post: post._id }));
  return ok(res, { item: postDto(post, { matches: matches.map((m) => postDto(m)), isFavorite }) });
}));

router.put('/:id', requireAuth, upload.array('images', 5), asyncHandler(async (req, res) => {
  const post = await req.models.Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Item not found.' });
  if (String(post.user) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied.' });
  const f = req.body;
  Object.assign(post, {
    title: f.title || post.title,
    description: f.description || f.desc || post.description,
    itemType: f.item_type || f.status || post.itemType,
    category: f.category ? normalizeCategory(f.category) : post.category,
    locationName: f.location || f.location_name || post.locationName,
    publicContact: f.contact || post.publicContact,
    rewardAmount: f.reward_amount === undefined ? post.rewardAmount : Number(f.reward_amount)
  });
  if (req.files?.length) {
    post.images.push(...req.files.map((file) => ({ path: `/uploads/items/${file.filename}`, isPrimary: post.images.length === 0, alt: post.title })));
  }
  await post.save();
  return ok(res, { item: postDto(await post.populate('user', 'fullName username')), message: 'Post updated.' });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const post = await req.models.Post.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Item not found.' });
  if (String(post.user) !== String(req.user._id) && req.user.role !== 'admin') return res.status(403).json({ success: false, message: 'Access denied.' });
  post.status = 'removed';
  await post.save();
  return ok(res, { message: 'Post deleted.' });
}));

export default router;
