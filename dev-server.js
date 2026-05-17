const http = require('http');
const fs = require('fs');
const path = require('path');
const { execFile } = require('child_process');
const querystring = require('querystring');
const crypto = require('crypto');

const rootDir = __dirname;
const port = Number(process.env.PORT || 8000);
const dbName = process.env.DB_NAME || 'lost_found_app';
const mysqlUser = process.env.DB_USER || 'root';
const mysqlPassword = process.env.DB_PASSWORD || '';

function send(res, status, body, type = 'text/html') {
  res.writeHead(status, { 'Content-Type': `${type}; charset=utf-8` });
  res.end(body);
}

function redirect(res, location) {
  res.writeHead(302, { Location: location });
  res.end();
}

function quote(value) {
  if (value === undefined || value === null || value === '') return 'NULL';
  return `'${String(value).replace(/\\/g, '\\\\').replace(/'/g, "''")}'`;
}

function mysql(sql) {
  return new Promise((resolve, reject) => {
    const args = ['-u', mysqlUser];
    if (mysqlPassword) args.push(`-p${mysqlPassword}`);
    args.push('--batch', '--raw', '--skip-column-names', dbName, '-e', sql);

    execFile('mysql', args, { windowsHide: true }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(stderr || error.message));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

function parseCookies(req) {
  const header = req.headers.cookie || '';
  return Object.fromEntries(header.split(';').filter(Boolean).map((part) => {
    const [key, ...rest] = part.trim().split('=');
    return [key, decodeURIComponent(rest.join('='))];
  }));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function parseMultipart(buffer, contentType) {
  const boundaryMatch = /boundary=(.+)$/i.exec(contentType || '');
  if (!boundaryMatch) return {};

  const boundary = `--${boundaryMatch[1]}`;
  const body = buffer.toString('binary');
  const fields = {};

  body.split(boundary).forEach((part) => {
    const nameMatch = /name="([^"]+)"/.exec(part);
    if (!nameMatch || part.includes('filename="')) return;

    const splitIndex = part.indexOf('\r\n\r\n');
    if (splitIndex === -1) return;

    const value = part.slice(splitIndex + 4).replace(/\r\n--$/, '').replace(/\r\n$/, '');
    fields[nameMatch[1]] = Buffer.from(value, 'binary').toString('utf8').trim();
  });

  return fields;
}

async function parseRequestFields(req) {
  const body = await readBody(req);
  const contentType = req.headers['content-type'] || '';

  if (contentType.includes('multipart/form-data')) {
    return parseMultipart(body, contentType);
  }

  if (contentType.includes('application/json')) {
    return JSON.parse(body.toString('utf8') || '{}');
  }

  return querystring.parse(body.toString('utf8'));
}

function hashPassword(password) {
  return `node_sha256$${crypto.createHash('sha256').update(String(password)).digest('hex')}`;
}

function verifyPassword(password, storedHash) {
  if (String(storedHash || '').startsWith('$2y$') || String(storedHash || '').startsWith('$2a$') || String(storedHash || '').startsWith('$2b$')) {
    return false;
  }
  return storedHash === hashPassword(password);
}

function wantsJson(req) {
  return String(req.headers.accept || '').includes('application/json')
    || String(req.headers['x-requested-with'] || '').toLowerCase() === 'xmlhttprequest';
}

function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers });
  res.end(JSON.stringify(body));
}

function authUserId(req) {
  return parseCookies(req).user_id || null;
}

async function getUserById(id) {
  const out = await mysql(`SELECT id, username, full_name, email, phone, country, location_name, avatar_url, role, is_verified, status, created_at,
    email_notifications, push_notifications, sms_notifications, marketing_notifications
    FROM users WHERE id = ${quote(id)} LIMIT 1`);
  const [user] = rowsToObjects(out, ['id', 'username', 'full_name', 'email', 'phone', 'country', 'location_name', 'avatar_url', 'role', 'is_verified', 'status', 'created_at',
    'email_notifications', 'push_notifications', 'sms_notifications', 'marketing_notifications']);
  return user || null;
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

function formBool(value, defaultValue = false) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'on', 'yes'].includes(String(value).toLowerCase());
}

function rowsToObjects(stdout, columns) {
  if (!stdout) return [];
  return stdout.split(/\r?\n/).filter(Boolean).map((line) => {
    const values = line.split('\t');
    return Object.fromEntries(columns.map((column, index) => [column, values[index] === 'NULL' ? null : values[index]]));
  });
}

async function handleRegister(req, res) {
  try {
    const f = await parseRequestFields(req);
    if (!f.username || !f.fullname || !f.email || !f.password || String(f.password).length < 6) {
      send(res, 422, JSON.stringify({ success: false, message: 'Invalid registration data.' }), 'application/json');
      return;
    }

    const sql = `INSERT INTO users (username, full_name, email, password_hash, phone, country, gender, date_of_birth)
      VALUES (${quote(f.username)}, ${quote(f.fullname)}, ${quote(f.email)}, ${quote(hashPassword(f.password))}, ${quote(f.phone)}, ${quote(f.country)}, ${quote(f.gender || 'other')}, ${quote(f.dob)})`;
    await mysql(sql);
    const id = await mysql(`SELECT id FROM users WHERE email = ${quote(f.email)} LIMIT 1`);
    await mysql(`INSERT INTO notifications (user_id, title, body, link_url)
      VALUES (${quote(id)}, 'Welcome to Lost & Found', 'Your account is ready. You can now post lost or found items.', 'Profile Page.html')`);

    const user = await getUserById(id);

    sendJson(res, 201, {
      success: true,
      message: 'Account created successfully.',
      redirect: 'DashBoard.html',
      user: publicUser(user)
    }, { 'Set-Cookie': `user_id=${encodeURIComponent(id)}; Path=/; SameSite=Lax` });
  } catch (error) {
    const duplicate = String(error.message || '').includes('Duplicate entry');
    sendJson(res, duplicate ? 409 : 500, {
      success: false,
      message: duplicate ? 'Email or username already exists.' : 'Registration failed after saving data. Please try again.'
    });
  }
}

async function handleLogin(req, res) {
  const f = await parseRequestFields(req);
  const out = await mysql(`SELECT id, password_hash FROM users WHERE email = ${quote(f.email)} AND status = 'active' LIMIT 1`);
  const [loginUser] = rowsToObjects(out, ['id', 'password_hash']);

  if (!loginUser || !verifyPassword(f.password, loginUser.password_hash)) {
    if (wantsJson(req)) return sendJson(res, 401, { success: false, message: 'Invalid email or password.' });
    send(res, 401, 'Invalid email or password.');
    return;
  }

  const user = await getUserById(loginUser.id);
  if (wantsJson(req)) {
    return sendJson(res, 200, {
      success: true,
      message: 'Login successful.',
      redirect: 'DashBoard.html',
      user: publicUser(user)
    }, { 'Set-Cookie': `user_id=${encodeURIComponent(loginUser.id)}; Path=/; SameSite=Lax` });
  }

  res.writeHead(302, {
    Location: '/DashBoard.html',
    'Set-Cookie': `user_id=${encodeURIComponent(loginUser.id)}; Path=/; SameSite=Lax`
  });
  res.end();
}

async function handleMe(req, res) {
  const userId = authUserId(req);
  if (!userId) return sendJson(res, 401, { success: false, message: 'Please login first.' });
  const user = await getUserById(userId);
  if (!user || user.status !== 'active') return sendJson(res, 401, { success: false, message: 'Please login first.' });

  const statsOut = await mysql(`SELECT
    (SELECT COUNT(*) FROM items WHERE user_id = ${quote(userId)} AND status <> 'removed') AS posts,
    (SELECT COUNT(*) FROM favorites WHERE user_id = ${quote(userId)}) AS favorites,
    (SELECT COUNT(*) FROM claims WHERE claimant_id = ${quote(userId)}) AS claims,
    (SELECT COUNT(*) FROM notifications WHERE user_id = ${quote(userId)} AND is_read = 0) AS unread`);
  const [stats] = rowsToObjects(statsOut, ['posts', 'favorites', 'claims', 'unread']);
  sendJson(res, 200, { success: true, user: publicUser(user), stats });
}

async function handleProfileUpdate(req, res) {
  const userId = authUserId(req);
  if (!userId) return sendJson(res, 401, { success: false, message: 'Please login first.' });

  const f = await parseRequestFields(req);
  if (!f.fullName || !f.email) return sendJson(res, 422, { success: false, message: 'Name and email are required.' });

  const currentOut = await mysql(`SELECT username, password_hash FROM users WHERE id = ${quote(userId)} LIMIT 1`);
  const [currentUser] = rowsToObjects(currentOut, ['username', 'password_hash']);
  if (!currentUser) return sendJson(res, 401, { success: false, message: 'Please login first.' });

  let passwordSql = '';
  if (f.newPassword) {
    if (!f.currentPassword || !verifyPassword(f.currentPassword, currentUser.password_hash)) {
      return sendJson(res, 422, { success: false, message: 'Current password is incorrect.' });
    }
    if (String(f.newPassword).length < 6) {
      return sendJson(res, 422, { success: false, message: 'New password must be at least 6 characters.' });
    }
    passwordSql = `, password_hash = ${quote(hashPassword(f.newPassword))}`;
  }

  try {
    await mysql(`UPDATE users SET
      username = ${quote(String(f.username || currentUser.username).replace(/^@+/, ''))},
      full_name = ${quote(f.fullName)},
      email = ${quote(f.email)},
      phone = ${quote(f.phone || '')},
      location_name = ${quote(f.location || '')},
      avatar_url = ${quote(f.avatar || '')},
      email_notifications = ${quote(formBool(f.emailNotif, true) ? 1 : 0)},
      push_notifications = ${quote(formBool(f.pushNotif, true) ? 1 : 0)},
      sms_notifications = ${quote(formBool(f.smsNotif, false) ? 1 : 0)},
      marketing_notifications = ${quote(formBool(f.marketingNotif, false) ? 1 : 0)}
      ${passwordSql}
      WHERE id = ${quote(userId)}`);
  } catch (error) {
    return sendJson(res, 409, { success: false, message: 'Email or username already exists.' });
  }

  await mysql(`INSERT INTO notifications (user_id, title, body, link_url)
    VALUES (${quote(userId)}, 'Profile Updated', 'Your profile information was saved successfully.', 'Profile Page.html')`);
  const user = await getUserById(userId);
  sendJson(res, 200, { success: true, message: 'Profile updated successfully.', user: publicUser(user) });
}

async function handleLogout(_req, res) {
  sendJson(res, 200, { success: true, redirect: 'Login.html' }, {
    'Set-Cookie': 'user_id=; Path=/; Max-Age=0; SameSite=Lax'
  });
}

async function handleNotifications(req, res) {
  const userId = authUserId(req);
  if (!userId) return sendJson(res, 401, { success: false, message: 'Please login first.' });
  const out = await mysql(`SELECT id, title, body, link_url, is_read, created_at
    FROM notifications WHERE user_id = ${quote(userId)} ORDER BY created_at DESC, id DESC LIMIT 50`);
  const rows = rowsToObjects(out, ['id', 'title', 'body', 'link_url', 'is_read', 'created_at']);
  sendJson(res, 200, {
    success: true,
    notifications: rows.map((n) => ({
      id: Number(n.id),
      title: n.title,
      description: n.body,
      type: 'system',
      actionLink: n.link_url || '#',
      actionText: 'Open',
      read: Number(n.is_read) === 1,
      createdAt: n.created_at
    }))
  });
}

async function handleCategoryStats(_req, res) {
  const out = await mysql(`SELECT category, COUNT(*) AS total FROM items WHERE status <> 'removed' GROUP BY category`);
  const rows = rowsToObjects(out, ['category', 'total']);
  const aliases = {
    electronics: 'electronics',
    pet: 'pets',
    pets: 'pets',
    bag: 'bag',
    key: 'key',
    paper: 'paper',
    documents: 'paper',
    jewelry: 'jewelry'
  };
  const counts = { electronics: 0, pets: 0, bag: 0, key: 0, paper: 0, jewelry: 0 };
  rows.forEach((row) => {
    const key = aliases[String(row.category || '').toLowerCase()] || String(row.category || '').toLowerCase();
    if (Object.prototype.hasOwnProperty.call(counts, key)) counts[key] += Number(row.total || 0);
  });
  sendJson(res, 200, { success: true, counts });
}

async function handleNotificationRead(req, res) {
  const userId = authUserId(req);
  if (!userId) return sendJson(res, 401, { success: false, message: 'Please login first.' });
  const f = await parseRequestFields(req);
  if (f.all) {
    await mysql(`UPDATE notifications SET is_read = 1 WHERE user_id = ${quote(userId)}`);
  } else if (f.id) {
    await mysql(`UPDATE notifications SET is_read = 1 WHERE user_id = ${quote(userId)} AND id = ${quote(f.id)}`);
  }
  sendJson(res, 200, { success: true });
}

async function handleCreatePost(req, res) {
  const cookies = parseCookies(req);
  const userId = cookies.user_id || 1;
  const f = await parseRequestFields(req);

  if (!f.title || !f.desc || !f.location) {
    send(res, 422, 'Please fill all required post fields.');
    return;
  }

  const sql = `INSERT INTO items (user_id, title, description, item_type, category, location_name, date_occurred, public_contact)
    VALUES (${quote(userId)}, ${quote(f.title)}, ${quote(f.desc)}, ${quote(f.status || 'lost')}, ${quote(f.category || 'others')}, ${quote(f.location)}, ${quote(f.date)}, ${quote(f.contact)})`;
  await mysql(sql);
  const id = await mysql('SELECT MAX(id) FROM items');
  redirect(res, `/backend-php/post_details_view.php?id=${id}`);
}

async function handleBrowseJson(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const q = url.searchParams.get('q') || '';
  const category = url.searchParams.get('category') || '';
  const type = url.searchParams.get('type') || '';
  const where = ["i.status <> 'removed'"];

  if (q) {
    where.push(`(i.title LIKE ${quote(`%${q}%`)} OR i.description LIKE ${quote(`%${q}%`)} OR i.location_name LIKE ${quote(`%${q}%`)})`);
  }
  if (category) {
    where.push(`i.category = ${quote(category)}`);
  }
  if (type === 'lost' || type === 'found') {
    where.push(`i.item_type = ${quote(type)}`);
  }

  const out = await mysql(`SELECT i.id, i.user_id, i.title, i.description, i.item_type, i.category, i.location_name, i.public_contact, i.reward_amount, i.priority_level, i.status, i.created_at, u.full_name
    FROM items i JOIN users u ON u.id = i.user_id
    WHERE ${where.join(' AND ')}
    ORDER BY i.created_at DESC`);
  const rows = rowsToObjects(out, ['id', 'user_id', 'title', 'description', 'item_type', 'category', 'location_name', 'public_contact', 'reward_amount', 'priority_level', 'status', 'created_at', 'full_name']);
  send(res, 200, JSON.stringify(rows), 'application/json');
}

async function handleBrowseView(url, res) {
  const q = url.searchParams.get('q') || '';
  const category = url.searchParams.get('category') || '';
  const type = url.searchParams.get('type') || '';
  const where = ["i.status <> 'removed'"];

  if (q) {
    where.push(`(i.title LIKE ${quote(`%${q}%`)} OR i.description LIKE ${quote(`%${q}%`)} OR i.location_name LIKE ${quote(`%${q}%`)})`);
  }
  if (category) {
    where.push(`i.category LIKE ${quote(`%${category}%`)}`);
  }
  if (type === 'lost' || type === 'found') {
    where.push(`i.item_type = ${quote(type)}`);
  }

  const out = await mysql(`SELECT i.id, i.user_id, i.title, i.description, i.item_type, i.category, i.location_name, i.created_at, u.full_name
    FROM items i JOIN users u ON u.id = i.user_id
    WHERE ${where.join(' AND ')}
    ORDER BY i.created_at DESC`);
  const rows = rowsToObjects(out, ['id', 'user_id', 'title', 'description', 'item_type', 'category', 'location_name', 'created_at', 'full_name']);
  const cards = rows.length ? rows.map((item) => `<article class="card">
      <div class="meta"><span class="pill ${item.item_type}">${item.item_type}</span><span class="pill">${item.category}</span></div>
      <h2>${item.title}</h2>
      <p>${item.description}</p>
      <p><i class="fa-solid fa-location-dot"></i> ${item.location_name}</p>
      <div class="card-actions">
        <a class="btn primary" href="/backend-php/post_details_view.php?id=${item.id}">Item Details</a>
        <a class="btn" href="/Chat.html?item_id=${item.id}&receiver_id=${item.user_id}">Chat</a>
        <a class="btn" href="/Claim Item.html?item_id=${item.id}">Claim</a>
      </div>
    </article>`).join('') : '<div class="empty-state"><h2>No items found</h2><p>Create a post first.</p></div>';

  send(res, 200, `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Browse Listings</title><link rel="stylesheet" href="/Browse Listing.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></head>
    <body><div class="app-shell"><aside class="sidebar"><a class="brand" href="/DashBoard.html">Lost & Found</a>
    <nav class="nav-list"><a href="/DashBoard.html">Dashboard</a><a class="active" href="/Browse Listing.html">Browse</a><a href="/Create Post.html">Post Item</a><a href="/Profile Page.html">Profile</a></nav></aside>
    <main class="content"><header class="topline"><div><p class="eyebrow">Database Listings</p><h1>Browse Lost & Found Items</h1></div><a class="btn primary" href="/Create Post.html">Post Item</a></header>
    <form class="filter-bar" method="get" action="/backend-php/browse_listing_view.php"><input name="q" value="${q}" placeholder="Search"><select name="type"><option value="">All</option><option value="lost">Lost</option><option value="found">Found</option></select><input name="category" value="${category}" placeholder="Category"><button class="btn primary">Search</button></form>
    <section class="grid" id="listingsGrid">${cards}</section></main></div></body></html>`);
}

async function handleDetailsView(url, res) {
  const id = url.searchParams.get('id') || '0';
  const out = await mysql(`SELECT i.id, i.user_id, i.title, i.description, i.item_type, i.category, i.location_name, i.public_contact, i.created_at, u.full_name
    FROM items i JOIN users u ON u.id = i.user_id WHERE i.id = ${quote(id)} LIMIT 1`);
  const [item] = rowsToObjects(out, ['id', 'user_id', 'title', 'description', 'item_type', 'category', 'location_name', 'public_contact', 'created_at', 'full_name']);

  if (!item) {
    send(res, 404, 'Item not found.');
    return;
  }

  send(res, 200, `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${item.title}</title><link rel="stylesheet" href="/Post Details.css">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"></head>
<body><main class="listing-hero"><div class="breadcrumb"><a href="/Browse Listing.html">Browse</a> / Details</div>
<div class="title-container"><div class="title-main"><div class="status-badge-hero">${item.item_type}</div><h1 class="detail-title">${item.title}</h1>
<div class="hero-meta"><span><i class="fas fa-map-marker-alt"></i> ${item.location_name}</span></div></div></div></main>
<div class="detail-wrapper"><div class="detail-left"><div class="card info-card"><h2 class="section-title">Description</h2><p class="detail-desc">${item.description}</p></div></div>
<div class="detail-right"><div class="card sticky-card action-card"><a class="action-btn btn-primary" href="/Chat.html?item_id=${item.id}&receiver_id=${item.user_id}">Chat with Owner</a>
<a class="action-btn btn-secondary" href="/Claim Item.html?item_id=${item.id}">Claim Item</a></div>
<div class="card summary-card"><div class="summary-row"><span>Posted By</span><strong>${item.full_name}</strong></div><div class="summary-row"><span>Category</span><strong>${item.category}</strong></div></div></div></div></body></html>`);
}

async function handleClaim(req, res) {
  const cookies = parseCookies(req);
  const claimantId = cookies.user_id || 1;
  const f = await parseRequestFields(req);

  if (!f.item_id || !f.fullName || !f.email || !f.phone || !f.proofDetails) {
    send(res, 422, 'Please fill required claim information.');
    return;
  }

  // Validate that the item exists
  const itemExists = await mysql(`SELECT id FROM items WHERE id = ${quote(f.item_id)} LIMIT 1`);
  if (!itemExists) {
    send(res, 404, 'Item not found.');
    return;
  }

  await mysql(`INSERT INTO claims (item_id, claimant_id, full_name, email, phone, nid_or_passport, proof_details, additional_info)
    VALUES (${quote(f.item_id)}, ${quote(claimantId)}, ${quote(f.fullName)}, ${quote(f.email)}, ${quote(f.phone)}, ${quote(f.nid)}, ${quote(f.proofDetails)}, ${quote(f.additionalInfo)})`);
  redirect(res, `/backend-php/post_details_view.php?id=${f.item_id}`);
}

async function handleMessage(req, res) {
  const cookies = parseCookies(req);
  const senderId = cookies.user_id || 1;
  const f = await parseRequestFields(req);

  if (!f.item_id || !f.receiver_id || !f.message) {
    send(res, 422, 'Invalid message data.');
    return;
  }

  // Validate that the item exists
  const itemExists = await mysql(`SELECT id FROM items WHERE id = ${quote(f.item_id)} LIMIT 1`);
  if (!itemExists) {
    send(res, 404, 'Item not found.');
    return;
  }

  const ownerId = Math.min(Number(senderId), Number(f.receiver_id));
  const participantId = Math.max(Number(senderId), Number(f.receiver_id));
  await mysql(`INSERT INTO conversations (item_id, owner_id, participant_id)
    VALUES (${quote(f.item_id)}, ${quote(ownerId)}, ${quote(participantId)})
    ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`);
  const convId = await mysql(`SELECT id FROM conversations WHERE item_id = ${quote(f.item_id)} AND owner_id = ${quote(ownerId)} AND participant_id = ${quote(participantId)} LIMIT 1`);
  await mysql(`INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (${quote(convId)}, ${quote(senderId)}, ${quote(f.message)})`);
  redirect(res, `/Chat.html?conversation_id=${convId}&item_id=${f.item_id}&receiver_id=${f.receiver_id}`);
}

function serveStatic(url, res) {
  const decodedPath = decodeURIComponent(url.pathname === '/' ? '/Landing Page.html' : url.pathname);
  const filePath = path.resolve(rootDir, `.${decodedPath}`);

  if (!filePath.startsWith(rootDir)) {
    send(res, 403, 'Forbidden');
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      send(res, 404, 'Not found');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const types = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, { 'Content-Type': `${types[ext] || 'application/octet-stream'}; charset=utf-8` });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === 'POST' && url.pathname === '/backend-php/register.php') return handleRegister(req, res);
    if (req.method === 'POST' && url.pathname === '/backend-php/login.php') return handleLogin(req, res);
    if (req.method === 'POST' && url.pathname === '/backend-php/logout.php') return handleLogout(req, res);
    if (req.method === 'GET' && url.pathname === '/backend-php/me.php') return handleMe(req, res);
    if (req.method === 'POST' && url.pathname === '/backend-php/profile.php') return handleProfileUpdate(req, res);
    if (req.method === 'GET' && url.pathname === '/backend-php/notifications.php') return handleNotifications(req, res);
    if (req.method === 'GET' && url.pathname === '/backend-php/category_stats.php') return handleCategoryStats(req, res);
    if (req.method === 'POST' && url.pathname === '/backend-php/notification_read.php') return handleNotificationRead(req, res);
    if (req.method === 'POST' && url.pathname === '/backend-php/create_post.php') return handleCreatePost(req, res);
    if (req.method === 'POST' && url.pathname === '/backend-php/claim_item.php') return handleClaim(req, res);
    if (req.method === 'POST' && url.pathname === '/backend-php/send_message.php') return handleMessage(req, res);
    if (req.method === 'GET' && url.pathname === '/backend-php/browse_listing.php') return handleBrowseJson(req, res);
    if (req.method === 'GET' && url.pathname === '/backend-php/browse_listing_view.php') return handleBrowseView(url, res);
    if (req.method === 'GET' && url.pathname === '/backend-php/post_details_view.php') return handleDetailsView(url, res);

    serveStatic(url, res);
  } catch (error) {
    send(res, 500, error.message);
  }
});

server.listen(port, () => {
  console.log(`Lost & Found dev server running at http://localhost:${port}`);
});
