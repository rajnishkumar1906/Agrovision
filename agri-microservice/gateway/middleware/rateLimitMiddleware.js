import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import redis, { isRedisReady } from '../config/redis.js';

const redisStore =
  isRedisReady() && redis
    ? new RedisStore({
        sendCommand: (...args) => redis.call(...args),
        prefix: 'rl:',
      })
    : undefined;

const rateLimitMiddleware = rateLimit({
  // If Redis isn't running, fall back to the built-in in-memory store.
  ...(redisStore ? { store: redisStore } : {}),
  windowMs: 60 * 1000,
  max: 20,
  message: 'Too many requests from this IP, please try again after a minute',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    return req.path === '/';
  },
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Too many requests from this IP. Limit: 20 requests per minute.',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

export default rateLimitMiddleware;
