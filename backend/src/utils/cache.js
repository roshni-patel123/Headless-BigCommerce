const env = require('../config/env');

const store = new Map();
let redis = null;
let redisReady = false;

function getCache(key) {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value;
}

async function getCacheAsync(key) {
  const local = getCache(key);
  if (local != null) return local;

  if (redisReady && redis) {
    try {
      const raw = await redis.get(key);
      if (!raw) return null;
      const value = JSON.parse(raw);
      // hydrate local for sync callers
      setCache(key, value, 60 * 1000);
      return value;
    } catch {
      return null;
    }
  }
  return null;
}

function setCache(key, value, ttlMs = 60 * 1000) {
  store.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });

  if (redisReady && redis) {
    redis.set(key, JSON.stringify(value), 'PX', ttlMs).catch(() => {});
  }
}

function clearCache(prefix) {
  if (!prefix) {
    store.clear();
  } else {
    for (const key of store.keys()) {
      if (key.startsWith(prefix) || key === prefix) store.delete(key);
    }
  }

  if (redisReady && redis) {
    if (!prefix) {
      redis.flushdb().catch(() => {});
      return;
    }
    redis.keys(`${prefix}*`).then((keys) => {
      if (keys.length) redis.del(...keys).catch(() => {});
    }).catch(() => {});
  }
}

async function initRedis() {
  if (!env.redisUrl || redis) return redis;
  try {
    // Optional dependency — install ioredis when REDIS_URL is set
    // eslint-disable-next-line import/no-extraneous-dependencies
    const Redis = require('ioredis');
    redis = new Redis(env.redisUrl, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      enableOfflineQueue: false,
    });
    await redis.connect();
    redisReady = true;
    console.log('Redis connected');
  } catch (error) {
    redisReady = false;
    redis = null;
    console.warn('Redis unavailable, using in-memory cache:', error.message);
  }
  return redis;
}

function isRedisReady() {
  return redisReady;
}

module.exports = {
  getCache,
  getCacheAsync,
  setCache,
  clearCache,
  initRedis,
  isRedisReady,
};
