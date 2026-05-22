export function ok(res, data = {}) {
  return res.json({ success: true, ...data });
}

export function created(res, data = {}) {
  return res.status(201).json({ success: true, ...data });
}

export function publicUser(user) {
  if (!user) return null;
  return {
    id: String(user._id),
    username: user.username,
    fullName: user.fullName,
    full_name: user.fullName,
    email: user.email,
    phone: user.phone || '',
    country: user.country || '',
    location: user.locationName || '',
    avatar: user.avatarUrl || '',
    role: user.role,
    isVerified: user.isVerified,
    status: user.status,
    preferences: user.preferences || {}
  };
}

export function legacyPath(path) {
  return String(path || '').replace(/^\/+/, '');
}
