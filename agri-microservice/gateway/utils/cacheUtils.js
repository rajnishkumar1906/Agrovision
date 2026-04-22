import redis, { isRedisReady } from '../config/redis.js';

export const saveToCacheAsync = async (
  cacheKey,
  data,
  expirySeconds = 3600,
  options = {}
) => {
  try {
    const payload = JSON.stringify(data);

    if (isRedisReady() && redis) {
      await redis.setex(cacheKey, expirySeconds, payload);
      console.log(`✓ Cached result with key: ${cacheKey} (expires in ${expirySeconds}s)`);
      return;
    }

    const memoryCache = options?.memoryCache;
    const ttlMsFromOptions = Number(options?.ttlMs);
    if (memoryCache && Number.isFinite(ttlMsFromOptions) && ttlMsFromOptions > 0) {
      const ttlMs = Math.min(ttlMsFromOptions, expirySeconds * 1000);
      memoryCache.set(cacheKey, { value: payload, expiresAt: Date.now() + ttlMs });
      console.log(`✓ Cached result in memory with key: ${cacheKey} (expires in ${Math.round(ttlMs / 1000)}s)`);
    }
  } catch (error) {
    console.error('Error saving to cache:', error);
  }
};
