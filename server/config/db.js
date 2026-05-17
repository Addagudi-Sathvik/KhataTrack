import dns from 'dns';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import logger from '../utils/logger.js';

let memoryServer;

function maskMongoUri(uri) {
  if (!uri) return 'not set';

  try {
    const parsed = new URL(uri);
    if (parsed.password) parsed.password = '****';
    return parsed.toString();
  } catch {
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:\s]+:)([^@\s]+)(@)/i, '$1****$3');
  }
}

function normalizeMongoUri(uri) {
  const trimmed = uri?.trim();
  if (!trimmed) return '';

  // Handles accidental .env values like MONGO_URI=MONGO_URI=mongodb+srv://...
  const nestedEnvPrefix = 'MONGO_URI=';
  if (trimmed.startsWith(nestedEnvPrefix)) {
    return trimmed.slice(nestedEnvPrefix.length).trim();
  }

  return trimmed;
}

export async function connectDB() {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
    logger.info('DNS servers set for MongoDB SRV lookup: 8.8.8.8, 8.8.4.4');

    const mongoUri = normalizeMongoUri(process.env.MONGO_URI);
    process.env.MONGO_URI = mongoUri;

    logger.info(`MONGO_URI loaded: ${mongoUri ? 'yes' : 'no'}`);
    logger.info(`MONGO_URI target: ${maskMongoUri(mongoUri)}`);

    if (!mongoUri && process.env.NODE_ENV !== 'production') {
      memoryServer = await MongoMemoryServer.create();
      process.env.MONGO_URI = memoryServer.getUri();
      logger.info(`MONGO_URI target: ${maskMongoUri(process.env.MONGO_URI)}`);
      logger.info('Using in-memory MongoDB for local development');
    }

    mongoose.set('strictQuery', true);
    await mongoose.connect(process.env.MONGO_URI);
    logger.info('✅ MongoDB Connected');
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);

    if (error.message?.includes('querySrv') || error.code === 'ECONNREFUSED') {
      logger.error(
        'MongoDB Atlas SRV DNS lookup failed. If mongodb+srv:// keeps failing on this network, use the standard mongodb:// connection string from Atlas instead.'
      );
    }

    throw error;
  }
}
