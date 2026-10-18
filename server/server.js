import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, MONGODB_URI } from './config/db.js';
import { seedMongoIfEmpty, isMongoActive } from './dataStore.js';
import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../atlas-credentials.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'RPR Capital Banking & Ledger Engine',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api', apiRouter);

// Serve production static assets from dist/
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback all unhandled GET requests to dist/index.html for React SPA Router
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.resolve(distPath, 'index.html');
    return res.sendFile(indexPath, (err) => {
      if (err) {
        res.status(200).send('RPR Capital API server is running. Build the frontend with `npm run build` to view the UI.');
      }
    });
  }
  next();
});

// Safety handlers to prevent process termination
process.on('uncaughtException', (err) => {
  console.warn('[Server Guard] Handled uncaught exception safely:', err.message);
});

process.on('unhandledRejection', (reason) => {
  console.warn('[Server Guard] Handled unhandled rejection safely:', reason?.message || reason);
});

// Start server and initialize database connection
async function startServer() {
  console.log(`[RPR Capital Server] Initializing on port ${PORT}...`);
  const maskedUri = (MONGODB_URI || '').replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`[RPR Capital Server] Target Atlas Database: ${maskedUri}`);

  // Connect to Atlas in background so server starts immediately
  connectDB().then(async (conn) => {
    if (conn) {
      await seedMongoIfEmpty();
    }
  }).catch((e) => {
    console.warn('[Server Notice] Initial Atlas connect handled:', e.message);
  });

  // Re-attempt Atlas connection periodically if initially not whitelisted (up to 3 retries)
  let retryCount = 0;
  const retryInterval = setInterval(async () => {
    if (retryCount >= 3) {
      clearInterval(retryInterval);
      console.log('[System Notice] Maximum background Atlas connection attempts reached. Serving seamlessly via local persistent ledger.');
      return;
    }
    if (!isMongoActive()) {
      retryCount++;
      try {
        const conn = await connectDB();
        if (conn) {
          await seedMongoIfEmpty();
          clearInterval(retryInterval);
        }
      } catch (err) {
        console.warn(`[System Notice] Reconnect attempt ${retryCount} notice:`, err.message);
      }
    }
  }, 30000);

  const server = app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`  RPR CAPITAL - FINANCIAL CORE LEDGER & DATABASE SERVER READY   `);
    console.log(`  Listening on: http://localhost:${PORT}                         `);
    console.log(`  API Endpoint: http://localhost:${PORT}/api/data               `);
    console.log(`  Branch Hub:   Jamawaramgarh Regional Desk, Jaipur             `);
    console.log(`================================================================`);
  });

  return server;
}

startServer();
