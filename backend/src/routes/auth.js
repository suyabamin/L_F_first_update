import { Router } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import { User, Notification } from '../models/index.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { created, ok, publicUser } from '../utils/http.js';
import { requireAuth, setAuthCookie, signToken } from '../middleware/auth.js';

const router = Router();

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error(errors.array()[0].msg);
    err.status = 422;
    throw err;
  }
};

router.post('/register', [
  body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters.'),
  body('email').isEmail().withMessage('Valid email is required.'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters.')
], asyncHandler(async (req, res) => {
  validate(req);
  const fullName = req.body.fullname || req.body.full_name || req.body.fullName;
  if (!fullName) return res.status(422).json({ success: false, message: 'Full name is required.' });

  const passwordHash = await bcrypt.hash(req.body.password, 12);
  const user = await User.create({
    username: req.body.username,
    fullName,
    email: req.body.email,
    passwordHash,
    phone: req.body.phone,
    country: req.body.country,
    gender: req.body.gender || 'other',
    dateOfBirth: req.body.dob || req.body.dateOfBirth || undefined
  });
  await Notification.create({
    user: user._id,
    title: 'Welcome to Lost & Found',
    body: 'Your account is ready. You can now post lost or found items.',
    linkUrl: 'DashBoard.html'
  });
  const token = signToken(user);
  setAuthCookie(res, token);
  return created(res, { token, user: publicUser(user), redirect: 'DashBoard.html', message: 'Account created successfully.' });
}));

router.post('/login', asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase(), status: 'active' }).select('+passwordHash');
  if (!user || !(await bcrypt.compare(req.body.password || '', user.passwordHash))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }
  const token = signToken(user);
  setAuthCookie(res, token);
  return ok(res, { token, user: publicUser(user), redirect: user.role === 'admin' ? 'Admin panel.html' : 'DashBoard.html', message: 'Login successful.' });
}));

router.post('/logout', (_req, res) => {
  res.clearCookie('lf_token', { httpOnly: true, sameSite: 'lax' });
  return ok(res, { redirect: 'Login.html' });
});

router.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const [posts, favorites, claims, unread] = await Promise.all([
    req.models.Post.countDocuments({ user: req.user._id, status: { $ne: 'removed' } }),
    req.models.Favorite.countDocuments({ user: req.user._id }),
    req.models.Claim.countDocuments({ claimant: req.user._id }),
    req.models.Notification.countDocuments({ user: req.user._id, isRead: false })
  ]);
  return ok(res, { user: publicUser(req.user), stats: { posts, favorites, claims, unread } });
}));

router.post('/forgot-password', asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() });
  if (user) {
    const raw = crypto.randomBytes(24).toString('hex');
    user.resetPasswordTokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save();
    return ok(res, { message: 'Password reset token created.', resetToken: raw });
  }
  return ok(res, { message: 'If the email exists, reset instructions were prepared.' });
}));

router.post('/reset-password', asyncHandler(async (req, res) => {
  const hash = crypto.createHash('sha256').update(req.body.token || '').digest('hex');
  const user = await User.findOne({ resetPasswordTokenHash: hash, resetPasswordExpires: { $gt: new Date() } }).select('+passwordHash');
  if (!user) return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
  user.passwordHash = await bcrypt.hash(req.body.password || '', 12);
  user.resetPasswordTokenHash = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();
  return ok(res, { message: 'Password reset successful.' });
}));

export default router;
