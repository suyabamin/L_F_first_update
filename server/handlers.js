const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const { query } = require('./db');
const { parseMultipart } = require('./multipart');
const { BUCKETS, saveFile } = require('./storage');
const {
  rootDir,
  hashPassword,
  verifyPassword,
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
} = require('./util');

async function getUserById(id) {
  const rows = await query(
    `SELECT id, username, full_name, email, phone, country, location_name, avatar_url, role, is_verified, status, created_at,
      email_notifications, push_notifications, sms_notifications, marketing_notifications
    FROM users WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function requireActiveUser(req, res) {
  const userId = authUserId(req);
  if (!userId) {
    sendError(res, 401, 'Please login first.', 'AUTH_REQUIRED');
    return null;
  }
  const user = await getUserById(userId);
  if (!user || user.status !== 'active') {
    sendError(res, 401, 'Please login first.', 'AUTH_REQUIRED');
    return null;
  }
  return user;
}

async function parseRequestFields(req) {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    const { fields } = await parseMultipart(req);
    return fields;
  }
  const body = await readBody(req);
  if (contentType.includes('application/json')) {
    return JSON.parse(body.toString('utf8') || '{}');
  }
  return querystring.parse(body.toString('utf8'));
}

async function parseRequestWithFiles(req) {
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    return parseMultipart(req);
  }
  const fields = await parseRequestFields(req);
  return { fields, files: [] };
}

function normalizeCategory(category) {
  const key = String(category || '').trim().toLowerCase();
  if (!key) return '';
  const aliases = {
    document: 'paper',
    documents: 'paper',
    paper: 'paper',
    papers: 'paper',
    'paper & docs': 'paper',
    key: 'key',
    keys: 'key',
    bag: 'bag',
    bags: 'bag',
    wallet: 'bag',
    wallets: 'bag',
    luggage: 'bag',
    pet: 'pets',
    pets: 'pets',
    electronics: 'electronics',
    electronic: 'electronics',
    jewelry: 'jewelry',
    jewellery: 'jewelry',
    others: 'others',
    other: 'others'
  };
  return aliases[key] || key;
}

// --- Auth ---
async function handleRegister(req, res) {
  try {
    const f = await parseRequestFields(req);
    if (!f.username || !f.fullname || !f.email || !f.password || String(f.password).length < 6) {
      return sendError(res, 422, 'Invalid registration data.', 'INVALID_DATA');
    }
    const result = await query(
      `INSERT INTO users (username, full_name, email, password_hash, phone, country, gender, date_of_birth)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [f.username, f.fullname, f.email, hashPassword(f.password), f.phone || null, f.country || null, f.gender || 'other', f.dob || null]
    );
    const id = result.insertId;
    await query(
      `INSERT INTO notifications (user_id, title, body, link_url) VALUES (?, ?, ?, ?)`,
      [id, 'Welcome to Lost & Found', 'Your account is ready. You can now post lost or found items.', 'DashBoard.html']
    );
    const user = await getUserById(id);
    return sendJson(
      res,
      201,
      { message: 'Account created successfully.', redirect: 'DashBoard.html', user: publicUser(user) },
      '',
      { 'Set-Cookie': `user_id=${encodeURIComponent(id)}; Path=/; HttpOnly; SameSite=Lax` }
    );
  } catch (error) {
    console.error('Register error:', error.message);
    const msg = String(error.message || '');
    const duplicate = msg.includes('UNIQUE') || msg.includes('Duplicate');
    return sendError(res, duplicate ? 409 : 500, duplicate ? 'Email or username already exists.' : `Registration failed: ${msg.slice(0, 120)}`, duplicate ? 'DUPLICATE' : 'SERVER_ERROR');
  }
}

async function handleHealth(_req, res) {
  try {
    const { ping, driver } = require('./db');
    await ping();
    const users = await query('SELECT COUNT(*) AS total FROM users');
    const items = await query("SELECT COUNT(*) AS total FROM items WHERE status <> 'removed'");
    return sendJson(res, 200, {
      database: driver,
      users: users[0]?.total ?? 0,
      items: items[0]?.total ?? 0
    });
  } catch (error) {
    return sendError(res, 503, error.message, 'HEALTH_ERROR');
  }
}

async function handleLogin(req, res) {
  const f = await parseRequestFields(req);
  const rows = await query(
    `SELECT id, password_hash FROM users WHERE email = ? AND status = 'active' LIMIT 1`,
    [f.email]
  );
  const loginUser = rows[0];
  if (!loginUser || !verifyPassword(f.password, loginUser.password_hash)) {
    if (wantsJson(req)) return sendError(res, 401, 'Invalid email or password.', 'INVALID_AUTH');
    return send(res, 401, 'Invalid email or password.');
  }
  const user = await getUserById(loginUser.id);
  const cookie = `user_id=${encodeURIComponent(loginUser.id)}; Path=/; HttpOnly; SameSite=Lax`;
  if (wantsJson(req)) {
    return sendJson(res, 200, { message: 'Login successful.', redirect: 'DashBoard.html', user: publicUser(user) }, '', { 'Set-Cookie': cookie });
  }
  return redirect(res, '/DashBoard.html', { 'Set-Cookie': cookie });
}

async function handleLogout(_req, res) {
  return sendJson(res, 200, { redirect: 'Login.html' }, 'Logout successful', {
    'Set-Cookie': 'user_id=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax'
  });
}

async function handleMe(req, res) {
  const userId = authUserId(req);
  if (!userId) return sendError(res, 401, 'Please login first.', 'AUTH_REQUIRED');
  const user = await getUserById(userId);
  if (!user || user.status !== 'active') return sendError(res, 401, 'Please login first.', 'AUTH_REQUIRED');
  const statsRows = await query(
    `SELECT
      (SELECT COUNT(*) FROM items WHERE user_id = ? AND status <> 'removed') AS posts,
      (SELECT COUNT(*) FROM favorites WHERE user_id = ?) AS favorites,
      (SELECT COUNT(*) FROM claims WHERE claimant_id = ?) AS claims,
      (SELECT COUNT(*) FROM notifications WHERE user_id = ? AND is_read = 0) AS unread`,
    [userId, userId, userId, userId]
  );
  return sendJson(res, 200, { user: publicUser(user), stats: statsRows[0] });
}

async function handleProfileUpdate(req, res) {
  const user = await requireActiveUser(req, res);
  if (!user) return;
  const f = await parseRequestFields(req);
  if (!f.fullName || !f.email) return sendError(res, 422, 'Name and email are required.', 'INVALID_DATA');

  const credRows = await query('SELECT password_hash FROM users WHERE id = ? LIMIT 1', [user.id]);
  const passwordHash = credRows[0]?.password_hash;

  let passwordSql = '';
  const params = [
    String(f.username || user.username).replace(/^@+/, ''),
    f.fullName,
    f.email,
    f.phone || '',
    f.location || '',
    f.avatar || '',
    formBool(f.emailNotif, true) ? 1 : 0,
    formBool(f.pushNotif, true) ? 1 : 0,
    formBool(f.smsNotif, false) ? 1 : 0,
    formBool(f.marketingNotif, false) ? 1 : 0
  ];

  if (f.newPassword) {
    if (!f.currentPassword || !verifyPassword(f.currentPassword, passwordHash)) {
      return sendError(res, 422, 'Current password is incorrect.', 'INVALID_PASSWORD');
    }
    if (String(f.newPassword).length < 6) {
      return sendError(res, 422, 'New password must be at least 6 characters.', 'PASSWORD_SHORT');
    }
    passwordSql = ', password_hash = ?';
    params.push(hashPassword(f.newPassword));
  }
  params.push(user.id);

  try {
    await query(
      `UPDATE users SET username = ?, full_name = ?, email = ?, phone = ?, location_name = ?, avatar_url = ?,
        email_notifications = ?, push_notifications = ?, sms_notifications = ?, marketing_notifications = ?
        ${passwordSql} WHERE id = ?`,
      params
    );
  } catch {
    return sendError(res, 409, 'Email or username already exists.', 'DUPLICATE');
  }

  await query(
    `INSERT INTO notifications (user_id, title, body, link_url) VALUES (?, ?, ?, ?)`,
    [user.id, 'Profile Updated', 'Your profile information was saved successfully.', 'Profile Page.html']
  );
  const updated = await getUserById(user.id);
  return sendJson(res, 200, { message: 'Profile updated successfully.', user: publicUser(updated) });
}

// --- Items ---
async function buildItemListWhere(url) {
  const q = url.searchParams.get('q') || '';
  const category = normalizeCategory(url.searchParams.get('category') || '');
  const type = url.searchParams.get('type') || '';
  const where = ["i.status <> 'removed'"];
  const params = [];

  if (q) {
    where.push('(i.title LIKE ? OR i.description LIKE ? OR i.location_name LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  if (category) {
    where.push('i.category = ?');
    params.push(category);
  }
  if (type === 'lost' || type === 'found') {
    where.push('i.item_type = ?');
    params.push(type);
  }
  return { where, params };
}

async function handleBrowseJson(req, res, url) {
  const { where, params } = await buildItemListWhere(url);
  const rows = await query(
    `SELECT i.id, i.user_id, i.title, i.description, i.item_type, i.category, i.location_name, i.public_contact,
      i.reward_amount, i.priority_level, i.status, i.created_at, i.view_count, u.full_name,
      (SELECT image_path FROM item_images img WHERE img.item_id = i.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS image_path
    FROM items i JOIN users u ON u.id = i.user_id
    WHERE ${where.join(' AND ')}
    ORDER BY i.created_at DESC`,
    params
  );
  return sendJson(res, 200, rows);
}

async function handleItemJson(req, res, url) {
  const id = url.searchParams.get('id');
  if (!id) return sendError(res, 400, 'Item id required.', 'ID_REQUIRED');

  const items = await query(
    `SELECT i.*, u.full_name, u.username
    FROM items i JOIN users u ON u.id = i.user_id
    WHERE i.id = ? AND i.status <> 'removed' LIMIT 1`,
    [id]
  );
  if (!items[0]) return sendError(res, 404, 'Item not found.', 'NOT_FOUND');

  await query('UPDATE items SET view_count = view_count + 1 WHERE id = ?', [id]);
  const images = await query('SELECT id, image_path, is_primary FROM item_images WHERE item_id = ? ORDER BY is_primary DESC, id ASC', [id]);

  const item = items[0];
  const oppositeType = item.item_type === 'lost' ? 'found' : 'lost';
  const keyword = `%${String(item.title).split(' ')[0]}%`;
  const matches = await query(
    `SELECT i.id, i.title, i.description, i.item_type, i.category, i.location_name, i.created_at,
      ((i.category = ?) * 40 + (i.location_name LIKE ?) * 30 + ((i.title LIKE ? OR i.description LIKE ?) * 30)) AS match_score
    FROM items i
    WHERE i.item_type = ? AND i.status = 'open' AND i.id <> ?
    ORDER BY match_score DESC, created_at DESC LIMIT 10`,
    [item.category, `%${item.location_name}%`, keyword, keyword, oppositeType, id]
  );

  const userId = authUserId(req);
  let isFavorite = false;
  if (userId) {
    const fav = await query('SELECT 1 FROM favorites WHERE user_id = ? AND item_id = ?', [userId, id]);
    isFavorite = fav.length > 0;
  }

  return sendJson(res, 200, {
    item: {
      ...item,
      type: item.item_type,
      location: item.location_name,
      postedBy: items[0].full_name,
      timeAgo: timeAgo(item.created_at),
      images: images.map((img) => img.image_path),
      matches,
      isFavorite
    }
  });
}

async function handleDashboardPosts(_req, res) {
  const rows = await query(
    `SELECT i.id, i.title, i.item_type, i.category, i.created_at,
      (SELECT image_path FROM item_images img WHERE img.item_id = i.id LIMIT 1) AS image_path
    FROM items i WHERE i.status <> 'removed' ORDER BY i.created_at DESC LIMIT 24`
  );
  const mapped = rows.map((row) => ({
    id: row.id,
    status: row.item_type,
    title: row.title,
    category: row.category,
    time: timeAgo(row.created_at),
    image_path: row.image_path
  }));
  return sendJson(res, 200, { posts: mapped });
}

async function handleCreatePost(req, res) {
  const userId = authUserId(req);
  if (!userId) {
    if (wantsJson(req)) return sendError(res, 401, 'Please login first.', 'AUTH_REQUIRED');
    return redirect(res, '/Login.html');
  }

  const { fields, files } = await parseRequestWithFiles(req);
  const f = fields;
  if (!f.title || !f.desc || !f.location) {
    if (wantsJson(req)) return sendError(res, 422, 'Please fill all required post fields.', 'INVALID_DATA');
    return send(res, 422, 'Please fill all required post fields.');
  }

  const result = await query(
    `INSERT INTO items (user_id, title, description, item_type, category, location_name, date_occurred, public_contact)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      userId,
      f.title,
      f.desc,
      f.status || 'lost',
      normalizeCategory(f.category) || 'others',
      f.location,
      f.date || null,
      f.contact || null
    ]
  );
  const itemId = result.insertId;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file.buffer?.length) continue;
    const saved = await saveFile({
      bucket: BUCKETS.ITEM_IMAGES,
      buffer: file.buffer,
      originalName: file.filename,
      mimeType: file.mimeType,
      uploadedBy: Number(userId),
      entityType: 'item',
      entityId: itemId
    });
    await query(
      'INSERT INTO item_images (item_id, image_path, storage_object_id, is_primary) VALUES (?, ?, ?, ?)',
      [itemId, saved.url, saved.id, i === 0 ? 1 : 0]
    );
  }

  await query(
    `INSERT INTO notifications (user_id, title, body, link_url) VALUES (?, ?, ?, ?)`,
    [userId, 'Post published', `Your listing "${f.title}" is now live.`, `Post Details.html?id=${itemId}`]
  );

  const redirectUrl = `/Post Details.html?id=${itemId}`;
  if (wantsJson(req)) {
    return sendJson(res, 201, { message: 'Post created.', id: itemId, redirect: redirectUrl });
  }
  return redirect(res, redirectUrl);
}

// --- Claims ---
async function handleClaim(req, res) {
  const userId = authUserId(req);
  if (!userId) {
    if (wantsJson(req)) return sendError(res, 401, 'Please login first.', 'AUTH_REQUIRED');
    return redirect(res, '/Login.html');
  }

  const f = await parseRequestFields(req);
  if (!f.item_id || !f.fullName || !f.email || !f.phone || !f.proofDetails) {
    if (wantsJson(req)) return sendError(res, 422, 'Please fill required claim information.', 'INVALID_DATA');
    return send(res, 422, 'Please fill required claim information.');
  }

  const exists = await query('SELECT id, user_id, title FROM items WHERE id = ? LIMIT 1', [f.item_id]);
  if (!exists[0]) {
    if (wantsJson(req)) return sendError(res, 404, 'Item not found.', 'NOT_FOUND');
    return send(res, 404, 'Item not found.');
  }

  const claimResult = await query(
    `INSERT INTO claims (item_id, claimant_id, full_name, email, phone, nid_or_passport, proof_details, additional_info)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [f.item_id, userId, f.fullName, f.email, f.phone, f.nid || null, f.proofDetails, f.additionalInfo || null]
  );

  await query(
    `INSERT INTO notifications (user_id, title, body, link_url) VALUES (?, ?, ?, ?)`,
    [
      exists[0].user_id,
      'New claim on your item',
      `Someone submitted a claim for "${exists[0].title}".`,
      `Post Details.html?id=${f.item_id}`
    ]
  );

  const redirectUrl = `/Post Details.html?id=${f.item_id}`;
  if (wantsJson(req)) {
    return sendJson(res, 201, {
      message: 'Claim submitted successfully.',
      id: claimResult.insertId,
      redirect: redirectUrl
    });
  }
  return redirect(res, redirectUrl);
}

// --- Messages ---
async function handleMessage(req, res) {
  const userId = authUserId(req);
  if (!userId) {
    if (wantsJson(req)) return sendError(res, 401, 'Please login first.', 'AUTH_REQUIRED');
    return redirect(res, '/Login.html');
  }

  const f = await parseRequestFields(req);
  if (!f.item_id || !f.receiver_id || !f.message) {
    if (wantsJson(req)) return sendError(res, 422, 'Invalid message data.', 'INVALID_DATA');
    return send(res, 422, 'Invalid message data.');
  }

  const ownerId = Math.min(Number(userId), Number(f.receiver_id));
  const participantId = Math.max(Number(userId), Number(f.receiver_id));

  await query(
    `INSERT INTO conversations (item_id, owner_id, participant_id) VALUES (?, ?, ?)
     ON CONFLICT(item_id, owner_id, participant_id) DO UPDATE SET updated_at = datetime('now')`,
    [f.item_id, ownerId, participantId]
  );
  const convs = await query(
    'SELECT id FROM conversations WHERE item_id = ? AND owner_id = ? AND participant_id = ? LIMIT 1',
    [f.item_id, ownerId, participantId]
  );
  if (!convs[0]) return sendError(res, 500, 'Failed to create conversation.', 'CONV_CREATE_FAILED');
  
  const convId = convs[0].id;
  await query('INSERT INTO messages (conversation_id, sender_id, message_text) VALUES (?, ?, ?)', [
    convId,
    userId,
    f.message
  ]);

  await query(
    `INSERT INTO notifications (user_id, title, body, link_url) VALUES (?, ?, ?, ?)`,
    [f.receiver_id, 'New message', 'You have a new message about a listing.', `Chat.html?conversation_id=${convId}&item_id=${f.item_id}&receiver_id=${userId}`]
  );

  const redirectUrl = `/Chat.html?conversation_id=${convId}&item_id=${f.item_id}&receiver_id=${f.receiver_id}`;
  if (wantsJson(req)) {
    return sendJson(res, 201, { conversation_id: convId }, 'Message sent successfully.');
  }
  return redirect(res, redirectUrl);
}

async function handleConversations(req, res) {
  const user = await requireActiveUser(req, res);
  if (!user) return;
  const userId = user.id;
  const rows = await query(
    `SELECT c.id, c.item_id, c.owner_id, c.participant_id, c.updated_at, i.title,
      (SELECT message_text FROM messages m WHERE m.conversation_id = c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
      (SELECT u.full_name FROM users u WHERE u.id = CASE WHEN c.owner_id = ? THEN c.participant_id ELSE c.owner_id END) AS other_name,
      (SELECT u.id FROM users u WHERE u.id = CASE WHEN c.owner_id = ? THEN c.participant_id ELSE c.owner_id END) AS other_id
     FROM conversations c
     JOIN items i ON i.id = c.item_id
     WHERE c.owner_id = ? OR c.participant_id = ?
     ORDER BY c.updated_at DESC`,
    [userId, userId, userId, userId]
  );
  return sendJson(res, 200, { conversations: rows });
}

async function handleMessages(req, res, url) {
  const user = await requireActiveUser(req, res);
  if (!user) return;
  const convId = url.searchParams.get('conversation_id');
  if (!convId) return sendError(res, 400, 'conversation_id required', 'CONV_ID_REQUIRED');

  const access = await query(
    'SELECT id FROM conversations WHERE id = ? AND (owner_id = ? OR participant_id = ?) LIMIT 1',
    [convId, user.id, user.id]
  );
  if (!access[0]) return sendError(res, 403, 'Access denied.', 'ACCESS_DENIED');

  const rows = await query(
    `SELECT m.id, m.sender_id, m.message_text, m.is_read, m.created_at, u.full_name
     FROM messages m JOIN users u ON u.id = m.sender_id
     WHERE m.conversation_id = ? ORDER BY m.created_at ASC`,
    [convId]
  );
  await query(
    'UPDATE messages SET is_read = 1 WHERE conversation_id = ? AND sender_id <> ?',
    [convId, user.id]
  );
  return sendJson(res, 200, { messages: rows, currentUserId: Number(user.id) });
}

// --- Favorites & reports ---
async function handleFavorite(req, res) {
  const user = await requireActiveUser(req, res);
  if (!user) return;
  const f = await parseRequestFields(req);
  const itemId = f.item_id;
  if (!itemId) return sendError(res, 400, 'item_id required', 'ID_REQUIRED');

  const existing = await query('SELECT 1 FROM favorites WHERE user_id = ? AND item_id = ?', [user.id, itemId]);
  if (existing.length) {
    await query('DELETE FROM favorites WHERE user_id = ? AND item_id = ?', [user.id, itemId]);
    return sendJson(res, 200, { favorited: false });
  }
  await query('INSERT INTO favorites (user_id, item_id) VALUES (?, ?)', [user.id, itemId]);
  return sendJson(res, 200, { favorited: true });
}

async function handleReport(req, res) {
  const userId = authUserId(req);
  const f = await parseRequestFields(req);
  if (!f.item_id || !f.reason) return sendError(res, 422, 'Reason and item are required.', 'INVALID_DATA');
  await query(
    'INSERT INTO reports (reporter_id, item_id, reason, details) VALUES (?, ?, ?, ?)',
    [userId || null, f.item_id, f.reason, f.details || null]
  );
  return sendJson(res, 201, { message: 'Report submitted. Our team will review it.' });
}

async function handleFeedback(req, res) {
  const userId = authUserId(req);
  const f = await parseRequestFields(req);
  if (!f.message) return sendError(res, 422, 'Feedback message is required.', 'INVALID_DATA');
  await query(
    'INSERT INTO reports (reporter_id, item_id, reason, details) VALUES (?, NULL, ?, ?)',
    [userId || null, 'User Feedback', f.message]
  );
  return sendJson(res, 201, { message: 'Thank you for your feedback.' });
}

// --- Notifications ---
async function handleNotifications(req, res) {
  const user = await requireActiveUser(req, res);
  if (!user) return;
  const rows = await query(
    `SELECT id, title, body, link_url, is_read, created_at FROM notifications
     WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 50`,
    [user.id]
  );
  return sendJson(res, 200, {
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

async function handleNotificationRead(req, res) {
  const user = await requireActiveUser(req, res);
  if (!user) return;
  const f = await parseRequestFields(req);
  if (f.all) {
    await query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [user.id]);
  } else if (f.id) {
    await query('UPDATE notifications SET is_read = 1 WHERE user_id = ? AND id = ?', [user.id, f.id]);
  }
  return sendJson(res, 200, { message: 'Notifications marked as read' });
}

async function handleCategoryStats(_req, res) {
  const rows = await query(
    `SELECT category, COUNT(*) AS total FROM items WHERE status <> 'removed' GROUP BY category`
  );
  const aliases = {
    electronics: 'electronics',
    pet: 'pets',
    pets: 'pets',
    bag: 'bag',
    key: 'key',
    paper: 'paper',
    documents: 'paper',
    jewelry: 'jewelry',
    wallet: 'bag',
    keys: 'key'
  };
  const counts = { electronics: 0, pets: 0, bag: 0, key: 0, paper: 0, jewelry: 0 };
  rows.forEach((row) => {
    const key = aliases[String(row.category || '').toLowerCase()] || String(row.category || '').toLowerCase();
    if (Object.prototype.hasOwnProperty.call(counts, key)) counts[key] += Number(row.total || 0);
  });
  return sendJson(res, 200, { counts });
}

// --- Admin ---
async function handleAdminStats(req, res) {
  const user = await requireActiveUser(req, res);
  if (!user || user.role !== 'admin') return sendError(res, 403, 'Admin access required.', 'FORBIDDEN');

  const users = await query("SELECT COUNT(*) AS total FROM users WHERE status = 'active'");
  const items = await query("SELECT COUNT(*) AS total FROM items WHERE status <> 'removed'");
  const reports = await query("SELECT COUNT(*) AS total FROM reports WHERE status = 'open'");
  const returned = await query("SELECT COUNT(*) AS total FROM items WHERE status = 'returned'");
  const claims = await query("SELECT COUNT(*) AS total FROM claims WHERE status = 'pending'");

  return sendJson(res, 200, {
    stats: {
      users: users[0].total,
      items: items[0].total,
      open_reports: reports[0].total,
      returned_items: returned[0].total,
      pending_claims: claims[0].total
    }
  });
}

async function handleAdminItems(req, res) {
  const user = await requireActiveUser(req, res);
  if (!user || user.role !== 'admin') return sendError(res, 403, 'Admin access required.', 'FORBIDDEN');
  const rows = await query(
    `SELECT i.id, i.title, i.item_type, i.category, i.status, i.created_at, u.full_name
     FROM items i JOIN users u ON u.id = i.user_id
     WHERE i.status <> 'removed' ORDER BY i.created_at DESC LIMIT 50`
  );
  return sendJson(res, 200, { items: rows });
}

async function handleAdminRemoveItem(req, res, itemId) {
  const user = await requireActiveUser(req, res);
  if (!user || user.role !== 'admin') return sendError(res, 403, 'Admin access required.', 'FORBIDDEN');
  await query("UPDATE items SET status = 'removed' WHERE id = ?", [itemId]);
  return sendJson(res, 200, { message: 'Item removed.' });
}

async function handleAdminClaims(req, res) {
  const user = await requireActiveUser(req, res);
  if (!user || user.role !== 'admin') return sendError(res, 403, 'Admin access required.', 'FORBIDDEN');
  const rows = await query(
    `SELECT c.*, i.title FROM claims c JOIN items i ON i.id = c.item_id ORDER BY c.created_at DESC LIMIT 50`
  );
  return sendJson(res, 200, { claims: rows });
}

async function handleAdminClaimUpdate(req, res, claimId) {
  const user = await requireActiveUser(req, res);
  if (!user || user.role !== 'admin') return sendError(res, 403, 'Admin access required.', 'FORBIDDEN');
  const f = await parseRequestFields(req);
  const status = ['approved', 'rejected'].includes(f.status) ? f.status : 'pending';
  await query("UPDATE claims SET status = ?, reviewed_by = ?, reviewed_at = datetime('now') WHERE id = ?", [
    status,
    user.id,
    claimId
  ]);
  return sendJson(res, 200, { message: 'Claim updated.' });
}

async function handleAdminReports(req, res) {
  const user = await requireActiveUser(req, res);
  if (!user || user.role !== 'admin') return sendError(res, 403, 'Admin access required.', 'FORBIDDEN');
  const rows = await query(
    `SELECT r.*, i.title AS item_title FROM reports r LEFT JOIN items i ON i.id = r.item_id
     ORDER BY r.created_at DESC LIMIT 50`
  );
  return sendJson(res, 200, { reports: rows });
}

// --- HTML views ---
async function handleBrowseView(url, res) {
  const qs = url.searchParams.toString();
  return redirect(res, `/Browse Listing.html${qs ? `?${qs}` : ''}`);
}

async function handleDetailsView(url, res) {
  const id = url.searchParams.get('id') || '0';
  return redirect(res, `/Post Details.html?id=${id}`);
}

function serveStatic(url, res) {
  const decodedPath = decodeURIComponent(url.pathname === '/' ? '/Landing Page.html' : url.pathname);
  const filePath = path.resolve(rootDir, `.${decodedPath}`);

  if (!filePath.startsWith(rootDir)) {
    return send(res, 403, 'Forbidden');
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      return send(res, 404, 'Not found');
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
    res.writeHead(200, {
      'Content-Type': `${types[ext] || 'application/octet-stream'}; charset=utf-8`,
      'Cache-Control': 'no-store'
    });
    res.end(data);
  });
}

async function routeRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;

  try {
    if (req.method === 'GET' && (pathname === '/backend-php' || pathname === '/backend-php/')) {
        return sendJson(res, 200, { status: 'healthy', version: '1.0.0-node-fallback', engine: 'SQLite3' }, 'Lost & Found API Backend');
    }
    if (req.method === 'GET' && pathname === '/backend-php/health.php') return handleHealth(req, res);
    if (req.method === 'POST' && pathname === '/backend-php/register.php') return handleRegister(req, res);
    if (req.method === 'POST' && pathname === '/backend-php/login.php') return handleLogin(req, res);
    if (req.method === 'POST' && pathname === '/backend-php/logout.php') return handleLogout(req, res);
    if (req.method === 'GET' && pathname === '/backend-php/me.php') return handleMe(req, res);
    if (req.method === 'POST' && pathname === '/backend-php/profile.php') return handleProfileUpdate(req, res);
    if (req.method === 'GET' && pathname === '/backend-php/notifications.php') return handleNotifications(req, res);
    if (req.method === 'GET' && pathname === '/backend-php/category_stats.php') return handleCategoryStats(req, res);
    if (req.method === 'POST' && pathname === '/backend-php/notification_read.php') return handleNotificationRead(req, res);
    if (req.method === 'POST' && pathname === '/backend-php/create_post.php') return handleCreatePost(req, res);
    if (req.method === 'POST' && pathname === '/backend-php/claim_item.php') return handleClaim(req, res);
    if (req.method === 'POST' && pathname === '/backend-php/send_message.php') return handleMessage(req, res);
    if (req.method === 'GET' && pathname === '/backend-php/browse_listing.php') return handleBrowseJson(req, res, url);
    if (req.method === 'GET' && pathname === '/backend-php/item.php') return handleItemJson(req, res, url);
    if (req.method === 'GET' && pathname === '/backend-php/dashboard_posts.php') return handleDashboardPosts(req, res);
    if (req.method === 'GET' && pathname === '/backend-php/conversations.php') return handleConversations(req, res);
    if (req.method === 'GET' && pathname === '/backend-php/messages.php') return handleMessages(req, res, url);
    if (req.method === 'POST' && pathname === '/backend-php/favorite.php') return handleFavorite(req, res);
    if (req.method === 'POST' && pathname === '/backend-php/report.php') return handleReport(req, res);
    if (req.method === 'POST' && pathname === '/backend-php/feedback.php') return handleFeedback(req, res);
    if (req.method === 'GET' && pathname === '/backend-php/admin/stats.php') return handleAdminStats(req, res);
    if (req.method === 'GET' && pathname === '/backend-php/admin/items.php') return handleAdminItems(req, res);
    if (req.method === 'GET' && pathname === '/backend-php/admin/claims.php') return handleAdminClaims(req, res);
    if (req.method === 'GET' && pathname === '/backend-php/admin/reports.php') return handleAdminReports(req, res);
    if (req.method === 'POST' && pathname.startsWith('/backend-php/admin/items/') && pathname.endsWith('/remove')) {
      const id = pathname.split('/')[4];
      return handleAdminRemoveItem(req, res, id);
    }
    if (req.method === 'POST' && pathname.startsWith('/backend-php/admin/claims/')) {
      const id = pathname.split('/')[4];
      return handleAdminClaimUpdate(req, res, id);
    }
    if (req.method === 'GET' && pathname === '/backend-php/browse_listing_view.php') return handleBrowseView(url, res);
    if (req.method === 'GET' && pathname === '/backend-php/post_details_view.php') return handleDetailsView(url, res);

    return serveStatic(url, res);
  } catch (error) {
    console.error(error);
    if (wantsJson(req)) return sendError(res, 500, error.message || 'Server error', 'SERVER_ERROR');
    return send(res, 500, error.message || 'Server error');
  }
}

module.exports = { routeRequest };
