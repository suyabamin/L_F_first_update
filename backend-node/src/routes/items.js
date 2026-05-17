import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../db.js';
import { requireLogin } from '../middleware/auth.js';

const router = Router();
const uploadDir = 'uploads/items';
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    const safeExt = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  }
});

const upload = multer({ storage });

router.get('/', async (req, res) => {
  const { type, category, q } = req.query;
  const where = [`i.status <> 'removed'`];
  const params = [];

  if (['lost', 'found'].includes(type)) {
    where.push('i.item_type = ?');
    params.push(type);
  }

  if (category) {
    where.push('i.category = ?');
    params.push(category);
  }

  if (q) {
    where.push('(i.title LIKE ? OR i.description LIKE ? OR i.location_name LIKE ?)');
    params.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }

  const [rows] = await pool.execute(
    `SELECT i.*, u.full_name,
      (SELECT image_path FROM item_images img WHERE img.item_id = i.id ORDER BY is_primary DESC, id ASC LIMIT 1) AS image_path
     FROM items i
     JOIN users u ON u.id = i.user_id
     WHERE ${where.join(' AND ')}
     ORDER BY i.created_at DESC`,
    params
  );

  res.json(rows);
});

router.post('/', requireLogin, upload.array('images', 5), async (req, res) => {
  const { title, description, desc, item_type, status, category, location, date_occurred, date, contact, reward_amount } = req.body;
  const itemType = item_type || status || 'lost';
  const details = description || desc;

  if (!title || !details || !location || !['lost', 'found'].includes(itemType)) {
    return res.status(400).json({ message: 'Required fields are missing' });
  }

  const [result] = await pool.execute(
    `INSERT INTO items
     (user_id, title, description, item_type, category, location_name, date_occurred, public_contact, reward_amount)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      req.session.user.id,
      title,
      details,
      itemType,
      category || 'others',
      location,
      date_occurred || date || null,
      contact || null,
      Number(reward_amount || 0)
    ]
  );

  for (const [index, file] of (req.files || []).entries()) {
    await pool.execute(
      'INSERT INTO item_images (item_id, image_path, is_primary) VALUES (?, ?, ?)',
      [result.insertId, `/uploads/items/${file.filename}`, index === 0 ? 1 : 0]
    );
  }

  res.status(201).json({ id: result.insertId, message: 'Post created successfully' });
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT i.*, u.full_name
     FROM items i
     JOIN users u ON u.id = i.user_id
     WHERE i.id = ? AND i.status <> 'removed'
     LIMIT 1`,
    [req.params.id]
  );

  if (!rows[0]) {
    return res.status(404).json({ message: 'Item not found' });
  }

  await pool.execute('UPDATE items SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);
  const [images] = await pool.execute('SELECT image_path FROM item_images WHERE item_id = ?', [req.params.id]);

  res.json({ ...rows[0], images });
});

router.get('/:id/matches', async (req, res) => {
  const [items] = await pool.execute('SELECT * FROM items WHERE id = ? LIMIT 1', [req.params.id]);
  const item = items[0];

  if (!item) {
    return res.status(404).json({ message: 'Item not found' });
  }

  const oppositeType = item.item_type === 'lost' ? 'found' : 'lost';
  const keyword = `%${item.title.split(' ')[0]}%`;

  const [matches] = await pool.execute(
    `SELECT *, 
      ((category = ?) * 40 + (location_name LIKE ?) * 30 + ((title LIKE ? OR description LIKE ?) * 30)) AS match_score
     FROM items
     WHERE item_type = ? AND status = 'open' AND id <> ?
     ORDER BY match_score DESC, created_at DESC
     LIMIT 10`,
    [item.category, `%${item.location_name}%`, keyword, keyword, oppositeType, item.id]
  );

  res.json(matches);
});

export default router;
