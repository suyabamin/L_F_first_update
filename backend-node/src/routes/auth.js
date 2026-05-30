import { Router } from 'express';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { pool } from '../db.js';
import { uploadToSupabase } from '../supabase.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/register', async (req, res) => {
  const { username, fullname, email, password, phone, country, gender, dob } = req.body;

  if (!username || !fullname || !email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Invalid registration data' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const [result] = await pool.execute(
      `INSERT INTO users (username, full_name, email, password_hash, phone, country, gender, date_of_birth)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, fullname, email, passwordHash, phone || null, country || null, gender || 'other', dob || null]
    );

    const newUser = { id: result.insertId, role: 'user', full_name: fullname, email, avatar_url: null };
    req.session.user = newUser;
    res.status(201).json({ user: newUser, message: 'Registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(409).json({ message: 'Email or username already exists' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [rows] = await pool.execute(
      'SELECT id, username, full_name, email, password_hash, role, status, avatar_url FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    const user = rows[0];
    if (!user || user.status !== 'active' || !(await bcrypt.compare(password || '', user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const userData = { 
      id: user.id, 
      username: user.username,
      role: user.role, 
      full_name: user.full_name, 
      email: user.email,
      avatar_url: user.avatar_url 
    };
    
    req.session.user = userData;
    res.json({ user: userData, message: 'Logged in successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

router.get('/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

router.get('/profile', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });
  const [rows] = await pool.execute(
    'SELECT id, username, full_name, email, phone, avatar_url, country, gender, date_of_birth FROM users WHERE id = ?',
    [req.session.user.id]
  );
  res.json(rows[0]);
});

router.put('/profile', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ message: 'Unauthorized' });
  const { full_name, phone, country, gender, date_of_birth } = req.body;
  
  await pool.execute(
    `UPDATE users SET full_name = ?, phone = ?, country = ?, gender = ?, date_of_birth = ? WHERE id = ?`,
    [full_name, phone, country, gender, date_of_birth, req.session.user.id]
  );
  
  // Update session
  req.session.user.full_name = full_name;
  
  res.json({ message: 'Profile updated' });
});

router.post('/avatar', upload.single('avatar'), async (req, res) => {
  if (!req.session.user || !req.file) return res.status(400).json({ message: 'Invalid request' });
  
  try {
    const publicUrl = await uploadToSupabase(req.file.buffer, req.file.originalname, req.file.mimetype, 'avatars');
    await pool.execute('UPDATE users SET avatar_url = ? WHERE id = ?', [publicUrl, req.session.user.id]);
    req.session.user.avatar_url = publicUrl;
    res.json({ avatar_url: publicUrl });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
