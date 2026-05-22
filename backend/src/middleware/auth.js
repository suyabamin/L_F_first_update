import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/index.js';

export function signToken(user) {
  return jwt.sign({ sub: String(user._id), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

export function setAuthCookie(res, token) {
  res.cookie('lf_token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
}

export async function attachUser(req, _res, next) {
  try {
    const bearer = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : null;
    const token = bearer || req.cookies?.lf_token;
    if (!token) return next();
    const decoded = jwt.verify(token, env.jwtSecret);
    const user = await User.findById(decoded.sub).select('+passwordHash');
    if (user && user.status === 'active') req.user = user;
  } catch {
    // Anonymous request.
  }
  next();
}

export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ success: false, message: 'Please login first.' });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Admin access required.' });
  }
  next();
}
