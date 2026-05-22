import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    return mongoose.connection;
  } catch (error) {
    const message = [
      `Could not connect to MongoDB at ${env.mongoUri}.`,
      '',
      'Start MongoDB first, then run the backend again:',
      '  1. Install/start MongoDB Community Server, or',
      '  2. Use MongoDB Atlas and set MONGO_URI in backend/.env, or',
      '  3. If Docker is installed, run from project root: docker compose up -d mongo',
      '',
      `Original error: ${error.message}`
    ].join('\n');
    const friendly = new Error(message);
    friendly.cause = error;
    throw friendly;
  }
}
