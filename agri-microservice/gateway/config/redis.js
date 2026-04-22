import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_ENABLED = (process.env.REDIS_ENABLED ?? 'true').toLowerCase() !== 'false';

let redis = null;

if (REDIS_ENABLED) {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    db: process.env.REDIS_DB || 0,
    password: process.env.REDIS_PASSWORD || undefined,
    // Don't crash the app if Redis isn't reachable
    maxRetriesPerRequest: null,
    enableOfflineQueue: false,
    lazyConnect: true,
    retryStrategy: (times) => {
      const delay = Math.min(times * 100, 2000);
      return delay;
    },
  });

  redis.on('connect', () => {
    console.log('✓ Redis Connected');
  });

  redis.on('error', (err) => {
    // Keep it non-fatal; other parts will fall back if Redis isn't ready.
    console.error('✗ Redis Error:', err.message);
  });

  // Kick off connection attempt, but don't let it crash startup
  redis.connect().catch(() => {});
}

export const redisEnabled = REDIS_ENABLED;
export const redisClient = redis;
export const isRedisReady = () => !!redis && redis.status === 'ready';

export default redis;
