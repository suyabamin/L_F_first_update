const crypto = require('crypto');
const path = require('path');

const rootDir = path.join(__dirname, '..');
let bcrypt = null;

try {
  bcrypt = require('bcryptjs');
} catch {
  try {
    bcrypt = require('../backend-node/node_modules/bcryptjs');
  } catch {
    bcrypt = null;
  }
}

function hashPassword(password) {
  if (bcrypt) {
    return bcrypt.hashSync(String(password), 12);
  }
  return `node_sha256$${crypto.createHash('sha256').update(String(password)).digest('hex')}`;
}

function verifyPassword(password, storedHash) {
  const hash = String(storedHash || '');
  if (hash.startsWith('$2y$') || hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
    return Boolean(bcrypt && bcrypt.compareSync(String(password), hash));
  }
  const legacyHash = `node_sha256$${crypto.createHash('sha256').update(String(password)).digest('hex')}`;
  return hash === legacyHash;
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(
    header.split(';').filter(Boolean).map((part) => {
      const [key, ...rest] = part.trim().split('=');
      return [key, decodeURIComponent(rest.join('='))];
    })
  );
}

function authUserId(req) {
  return parseCookies(req).user_id || null;
}

function wantsJson(req) {
  return (
    String(req.headers.accept || '').includes('application/json') ||
    String(req.headers['x-requested-with'] || '').toLowerCase() === 'xmlhttprequest'
  );
}

function send(res, status, body, type = 'text/html') {
  res.writeHead(status, { 'Content-Type': `${type}; charset=utf-8` });
  res.end(body);
}

function sendJson(res, status, data, message = '', headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  const responseBody = {
    success: true,
    message: message || 'Success'
  };
  
  if (Array.isArray(data)) {
    responseBody.data = data;
  } else if (data && typeof data === 'object') {
    Object.assign(responseBody, data);
    if (!responseBody.data) responseBody.data = data; // Keep for compatibility if needed
  } else {
    responseBody.data = data;
  }

  res.end(JSON.stringify(responseBody));
}

function sendError(res, status, message, error = null, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify({
    success: false,
    data: null,
    message: message || 'An error occurred',
    error: error || 'UNKNOWN_ERROR'
  }));
}


function redirect(res, location, headers = {}) {
  res.writeHead(302, { Location: location, ...headers });
  res.end();
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function formBool(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'on', 'yes'].includes(String(value).toLowerCase());
}

function publicUser(user) {
  if (!user) return null;
  return {
    id: Number(user.id),
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone || '',
    country: user.country || '',
    location: user.location_name || user.country || '',
    avatar: user.avatar_url || '',
    role: user.role,
    isVerified: Number(user.is_verified) === 1,
    createdAt: user.created_at,
    preferences: {
      email: Number(user.email_notifications) === 1,
      push: Number(user.push_notifications) === 1,
      sms: Number(user.sms_notifications) === 1,
      marketing: Number(user.marketing_notifications) === 1
    }
  };
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function timeAgo(dateStr) {
  if (!dateStr) return 'Recently';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${Math.max(1, mins)} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
  return new Date(dateStr).toLocaleDateString();
}

module.exports = {
  rootDir,
  hashPassword,
  verifyPassword,
  parseCookies,
  authUserId,
  wantsJson,
  send,
  sendJson,
  sendError,
  redirect,
  readBody,
  formBool,
  publicUser,
  escapeHtml,
  timeAgo
};
