import express from 'express';
import session from 'express-session';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import itemRoutes from './routes/items.js';
import claimRoutes from './routes/claims.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: true, credentials: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'change_this_secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax' }
}));

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/auth', authRoutes);
app.use('/items', itemRoutes);
app.use('/claims', claimRoutes);
app.use('/messages', messageRoutes);
app.use('/admin', adminRoutes);

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Lost & Found backend running on http://localhost:${port}`);
});

