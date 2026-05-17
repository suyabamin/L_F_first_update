export function requireLogin(req, res, next) {
  if (!req.session.user) {
    return res.status(401).json({ message: 'Login required' });
  }
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
}

