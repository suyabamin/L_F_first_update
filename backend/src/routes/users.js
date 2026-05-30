import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ok, publicUser } from '../utils/http.js';
import { env } from '../config/env.js';

const router = Router();
const avatarDir = path.join(env.uploadDir, 'avatars');
fs.mkdirSync(avatarDir, { recursive: true });
const storage = multer.diskStorage({
  destination: avatarDir,
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname).toLowerCase()}`)
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

router.get('/profile', requireAuth, (req, res) => ok(res, { user: publicUser(req.user) }));

router.post('/profile', requireAuth, upload.single('avatarFile'), asyncHandler(async (req, res) => {
  const f = req.body;
  req.user.username = String(f.username || req.user.username).replace(/^@+/, '');
  req.user.fullName = f.fullName || f.full_name || f.fullname || req.user.fullName;
  req.user.email = f.email || req.user.email;
  req.user.phone = f.phone || '';
  req.user.locationName = f.location || f.locationName || '';
  req.user.avatarUrl = req.file ? `/uploads/avatars/${req.file.filename}` : (f.avatar || req.user.avatarUrl || '');
  req.user.preferences = {
    email: f.emailNotif !== 'false',
    push: f.pushNotif !== 'false',
    sms: f.smsNotif === 'true' || f.smsNotif === 'on',
    marketing: f.marketingNotif === 'true' || f.marketingNotif === 'on'
  };
  if (f.newPassword) {
    const current = await req.models.User.findById(req.user._id).select('+passwordHash');
    const matches = await bcrypt.compare(f.currentPassword || '', current.passwordHash);
    if (!matches) return res.status(422).json({ success: false, message: 'Current password is incorrect.' });
    req.user.passwordHash = await bcrypt.hash(f.newPassword, 12);
  }
  await req.user.save();
  return ok(res, { user: publicUser(req.user), message: 'Profile updated successfully.' });
}));

router.delete('/profile', requireAuth, asyncHandler(async (req, res) => {
  req.user.status = 'suspended';
  await req.user.save();
  res.clearCookie('lf_token');
  return ok(res, { message: 'Account deactivated.' });
}));

router.get('/:id', asyncHandler(async (req, res) => {
  const u = await req.models.User.findById(req.params.id);
  if (!u) return res.status(404).json({ success: false, message: 'User not found.' });
  return ok(res, { user: publicUser(u) });
}));

export default router;
