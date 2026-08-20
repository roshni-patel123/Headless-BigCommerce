/**
 * Maps browser session id → BigCommerce cart id.
 * Uses shared cache (in-memory + optional Redis).
 */
const { getCache, setCache, clearCache } = require('../utils/cache');

const PREFIX = 'bc:cart:';
const TTL_MS = 7 * 24 * 60 * 60 * 1000;

function key(sessionId) {
  return `${PREFIX}${sessionId || 'anon'}`;
}

function getCartId(sessionId) {
  if (!sessionId) return null;
  return getCache(key(sessionId));
}

function setCartId(sessionId, cartId) {
  if (!sessionId || !cartId) return;
  setCache(key(sessionId), cartId, TTL_MS);
}

function clearCartId(sessionId) {
  if (!sessionId) return;
  clearCache(key(sessionId));
}

module.exports = {
  getCartId,
  setCartId,
  clearCartId,
};
