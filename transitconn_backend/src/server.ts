import 'dotenv/config';
import { validateEnv } from './config/env';

validateEnv();

import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { env } from './config/env';
import routes from './routes';
import { notFoundHandler, globalErrorHandler } from './middlewares/error.middleware';
import { checkDbConnection } from './config/database';
import path from 'path';
import { initSocket } from './socket/chat';

const app = express();
const httpServer = createServer(app);

// ── Socket.io ─────────────────────────────────────────────────
initSocket(httpServer);

// ── Sécurité ──────────────────────────────────────────────────
app.use(helmet());

// ── CORS ──────────────────────────────────────────────────────
app.use(cors({
  origin: "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Rate limiting ─────────────────────────────────────────────
app.use('/api/', rateLimit({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  message: { success: false, message: 'Trop de requêtes.' },
}));

// ── Body parsers ──────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// ── Routes ────────────────────────────────────────────────────
app.use('/api', routes);

// ── Health check ──────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    status: 'OK',
    service: 'TransitConn API',
    version: '1.0.0',
    environment: env.NODE_ENV,
  });
});

// ── Erreurs ───────────────────────────────────────────────────
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ── Démarrage ─────────────────────────────────────────────────
async function start(): Promise<void> {
  await checkDbConnection();

  httpServer.listen(env.PORT, () => {
    console.info(`
╔════════════════════════════════════════════╗
║         TransitConn API — v1.0.0           ║
╠════════════════════════════════════════════╣
║  Port    : ${env.PORT}                          ║
║  Env     : ${env.NODE_ENV}                  ║
║  DB      : PostgreSQL connecté             ║
╚════════════════════════════════════════════╝
    `);
  });
}

start().catch((err) => {
  console.error('Erreur au démarrage:', err);
  process.exit(1);
});