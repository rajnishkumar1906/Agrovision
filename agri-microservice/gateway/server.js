import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import redis, { redisEnabled, isRedisReady } from './config/redis.js';
import rateLimitMiddleware from './middleware/rateLimitMiddleware.js';
import jwtVerifyMiddleware from './middleware/jwtMiddleware.js';
import cachingMiddleware from './middleware/cachingMiddleware.js';
import apiRoutes from './routes/apiRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply rate limiting to all routes except health check
app.use(rateLimitMiddleware);

// Health check endpoint (no auth, no rate limit)
app.get('/', (req, res) => {
  res.json({
    message: 'API Gateway is running',
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (req, res) => {
  res.json({
    message: 'Gateway Health Check',
    status: 'healthy',
    redis: redisEnabled ? (isRedisReady() ? 'connected' : 'disconnected') : 'disabled',
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes (includes both public auth routes and protected routes)
app.use('/api', apiRoutes);



// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message,
  });
});

const getPreferredPort = () => {
  const raw = process.env.PORT;
  const parsed = raw ? Number(raw) : 5001;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 5001;
};

const printBanner = (port) => {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 Advanced API Gateway running on http://localhost:${port}`);
  console.log(`${'='.repeat(70)}\n`);
  console.log('📋 Request Flow:');
  console.log('  1. Rate Limit Check (Redis)');
  console.log('  2. JWT Verification');
  console.log('  3. Response Cache Check (Redis)');
  console.log('  4. Forward to Python Services');
  console.log('  5. Cache Response (async)');
  console.log('\n📍 Available Endpoints:');
  console.log('  GET  /');
  console.log('  GET  /health');
  console.log('  POST /api/auth/register      (public)');
  console.log('  POST /api/auth/login         (public)');
  console.log('  POST /api/auth/verify        (public)');
  console.log('  POST /api/recommend          (requires token)');
  console.log('  POST /api/disease-detect     (requires token)');
  console.log('  GET  /api/history            (requires token)');
  console.log('  GET  /api/health             (requires token)');
  console.log(`\n${'='.repeat(70)}\n`);
};

const server = http.createServer(app);

const tryListen = (port, attemptsLeft = 10) => {
  server.listen(port, () => printBanner(port));

  server.once('error', (err) => {
    if (err?.code === 'EADDRINUSE' && attemptsLeft > 0) {
      const nextPort = port + 1;
      console.error(`✗ Port ${port} is already in use. Trying ${nextPort}...`);
      setTimeout(() => tryListen(nextPort, attemptsLeft - 1), 200);
      return;
    }

    console.error('✗ Failed to start server:', err);
    process.exit(1);
  });
};

tryListen(getPreferredPort());

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  if (redis) redis.disconnect();
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  if (redis) redis.disconnect();
  process.exit(0);
});
