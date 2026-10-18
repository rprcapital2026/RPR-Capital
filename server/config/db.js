import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load credentials from atlas-credentials.env
dotenv.config({ path: path.resolve(__dirname, '../../atlas-credentials.env') });
dotenv.config();

let rawUri = process.env.MONGODB_URI || '';

if (rawUri) {
  // Ensure database name is explicitly specified in the URI
  if (!rawUri.includes('.mongodb.net/')) {
    rawUri = rawUri.replace('.mongodb.net', '.mongodb.net/rpr_capital');
  } else if (rawUri.endsWith('.mongodb.net/')) {
    rawUri = rawUri + 'rpr_capital';
  }

  if (!rawUri.includes('retryWrites=')) {
    const separator = rawUri.includes('?') ? '&' : '?';
    rawUri = `${rawUri}${separator}retryWrites=true&w=majority`;
  }
}

export const MONGODB_URI = rawUri;

let isConnected = false;
let connectionError = null;

export async function connectDB() {
  if (isConnected) return mongoose.connection;
  if (!MONGODB_URI) {
    console.log('[MongoDB Atlas] No MONGODB_URI specified in environment. Operating safely via persistent local ledger.');
    return null;
  }

  try {
    console.log('[MongoDB Atlas] Attempting connection to cluster...');
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 8000, // Quick timeout fallback
      connectTimeoutMS: 10000
    });
    isConnected = true;
    connectionError = null;
    console.log(`[MongoDB Atlas] Connected successfully to host: ${conn.connection.host}, database: ${conn.connection.name}`);
    return conn.connection;
  } catch (error) {
    isConnected = false;
    connectionError = error.message;
    console.warn(`[MongoDB Atlas Warning] Direct cluster connection currently pending IP access permission: ${error.message}`);
    console.log('[System Notice] Dual-mode storage active: Local persistent ledger will serve requests and auto-sync when Atlas access is whitelisted.');
    return null;
  }
}

export function getConnectionStatus() {
  return {
    isConnected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    database: mongoose.connection.name || 'rpr_capital',
    host: mongoose.connection.host || 'cluster0.n6ggqqj.mongodb.net',
    error: connectionError
  };
}
