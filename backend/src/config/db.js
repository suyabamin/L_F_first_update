import mongoose from 'mongoose';
import { env } from './env.js';

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  
  try {
    console.log(`Connecting to MongoDB at ${env.mongoUri}...`);
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    console.log('Successfully connected to primary MongoDB.');
    return mongoose.connection;
  } catch (error) {
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }

    console.warn('Could not connect to primary MongoDB. Attempting fallback to in-memory database...');
    
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      
      console.log(`Starting in-memory MongoDB at ${uri}`);
      await mongoose.connect(uri);
      console.log('Successfully connected to in-memory MongoDB.');
      
      // Store reference to keep mongod running
      mongoose.connection._mongod = mongod;
      
      return mongoose.connection;
    } catch (fallbackError) {
      const message = [
        `Could not connect to MongoDB at ${env.mongoUri} and fallback failed.`,
        '',
        'Start MongoDB first, then run the backend again:',
        '  1. Install/start MongoDB Community Server, or',
        '  2. Use MongoDB Atlas and set MONGO_URI in backend/.env, or',
        '  3. If Docker is installed, run from project root: docker compose up -d mongo',
        '',
        `Original error: ${error.message}`,
        `Fallback error: ${fallbackError.message}`
      ].join('\n');
      const friendly = new Error(message);
      friendly.cause = fallbackError;
      throw friendly;
    }
  }
}

