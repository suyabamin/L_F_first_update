import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { Server as SocketIOServer } from 'socket.io';
import { env } from './config/env.js';
import { connectDatabase } from './config/db.js';
import * as models from './models/index.js';
import { attachUser } from './middleware/auth.js';
import { errorHandler, notFound } from './middleware/error.js';
import { configureSockets } from './sockets/index.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import postRoutes from './routes/posts.js';
import favoriteRoutes from './routes/favorites.js';
import claimRoutes from './routes/claims.js';
import messageRoutes from './routes/messages.js';
import conversationRoutes from './routes/conversations.js';
import notificationRoutes from './routes/notifications.js';
import reportRoutes from './routes/reports.js';
import adminRoutes from './routes/admin.js';
import legacyRoutes from './routes/legacy.js';
import { seedDemoData } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

fs.mkdirSync(path.resolve(rootDir, env.uploadDir), { recursive: true });

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: { origin: env.frontendOrigin, credentials: true }
});
configureSockets(io);

app.set('trust proxy', 1);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: [env.frontendOrigin, 'http://127.0.0.1:8000'], credentials: true }));
app.use(rateLimit({ windowMs: 60 * 1000, limit: env.rateLimitPerMinute, standardHeaders: true, legacyHeaders: false }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '1mb' }));
app.use(mongoSanitize());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.resolve(rootDir, env.uploadDir)));
app.use((req, _res, next) => {
  req.io = io;
  req.models = models;
  next();
});
app.use(attachUser);

app.get('/health', (_req, res) => res.json({ success: true, ok: true, database: 'mongodb' }));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/claims', claimRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/backend-php', legacyRoutes);
app.use(notFound);
app.use(errorHandler);

async function start() {
  await connectDatabase();
  await seedDemoData();
  server.listen(env.port, () => {
    console.log(`Lost & Found API running at http://localhost:${env.port}`);
    console.log(`Frontend origin allowed: ${env.frontendOrigin}`);
  });
}

start().catch((error) => {
  console.error('Backend failed to start:', error);
  process.exit(1);
});
