import crypto from 'crypto';
import redis, { isRedisReady } from '../config/redis.js';

const generateHash = (data) => {
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
};

const memoryCache = new Map(); // key -> { value, expiresAt }
const MEMORY_TTL_MS = Number(process.env.MEMORY_CACHE_TTL_MS || 5 * 60 * 1000);

const cachingMiddleware = async (req, res, next) => {
  if (req.method !== 'POST' || !req.path.includes('/recommend')) {
    return next();
  }

  try {
    const dataHash = generateHash(req.body);
    const cacheKey = `cache:recommend:${dataHash}`;

    // Prefer Redis if available, otherwise fall back to in-memory cache.
    let cachedData = null;
    if (isRedisReady() && redis) {
      cachedData = await redis.get(cacheKey);
    } else {
      const entry = memoryCache.get(cacheKey);
      if (entry && entry.expiresAt > Date.now()) cachedData = entry.value;
      if (entry && entry.expiresAt <= Date.now()) memoryCache.delete(cacheKey);
    }

    if (cachedData) {
      console.log(`✓ Cache HIT for key: ${cacheKey}`);
      return res.status(200).json({
        success: true,
        message: 'Response from cache (instant result)',
        data: JSON.parse(cachedData),
        cached: true,
        latency: '<1ms',
      });
    }

    console.log(`✗ Cache MISS for key: ${cacheKey}`);

    req.cacheKey = cacheKey;
    req.dataHash = dataHash;
    req.__memoryCache = { memoryCache, ttlMs: MEMORY_TTL_MS };

    next();
  } catch (error) {
    console.error('Caching middleware error:', error);
    next();
  }
};

export default cachingMiddleware;
