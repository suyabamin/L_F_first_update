import { Router } from 'express';
import multer from 'multer';
import { pool } from '../db.js';
import { requireLogin } from '../middleware/auth.js';
import { uploadToSupabase } from '../supabase.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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
    `SELECT i.*, u.full_name, u.avatar_url as user_avatar,
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

  const itemId = result.insertId;

  if (req.files && req.files.length > 0) {
    for (const [index, file] of req.files.entries()) {
      try {
        const publicUrl = await uploadToSupabase(file.buffer, file.originalname, file.mimetype, 'items');
        await pool.execute(
          'INSERT INTO item_images (item_id, image_path, is_primary) VALUES (?, ?, ?)',
          [itemId, publicUrl, index === 0 ? 1 : 0]
        );
      } catch (err) {
        console.error('[ERROR] Image upload failed:', err.message);
      }
    }
  }

  res.status(201).json({ id: itemId, message: 'Post created successfully' });
});

router.get('/:id', async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT i.*, u.full_name, u.avatar_url as user_avatar
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

export default router;
