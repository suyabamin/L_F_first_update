import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../db.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { username, fullname, full_name, email, password, phone, country, gender, dob } = req.body;
  const name = fullname || full_name;

  if (!username || !name || !email || !password || password.length < 6) {
    return res.status(400).json({ message: 'Invalid registration data' });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  try {
    const [result] = await pool.execute(
      `INSERT INTO users (username, full_name, email, password_hash, phone, country, gender, date_of_birth)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username, name, email, passwordHash, phone || null, country || null, gender || 'other', dob || null]
    );

    req.session.user = { id: result.insertId, role: 'user' };
    res.status(201).json({ id: result.insertId, message: 'Registered successfully' });
  } catch {
    res.status(409).json({ message: 'Email or username already exists' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await pool.execute(
    'SELECT id, password_hash, role, status FROM users WHERE email = ? LIMIT 1',
    [email]
  );

  const user = rows[0];
  if (!user || user.status !== 'active' || !(await bcrypt.compare(password || '', user.password_hash))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  req.session.user = { id: user.id, role: user.role };
  res.json({ id: user.id, role: user.role, message: 'Logged in successfully' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out' }));
});

router.get('/me', (req, res) => {
  res.json({ user: req.session.user || null });
});

export default router;

