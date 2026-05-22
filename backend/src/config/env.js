import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/lost_found_app',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-this-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendOrigin: process.env.FRONTEND_ORIGIN || 'http://localhost:8000',
  uploadDir: process.env.UPLOAD_DIR || 'uploads',
  rateLimitPerMinute: Number(process.env.RATE_LIMIT_PER_MINUTE || 240)
};
