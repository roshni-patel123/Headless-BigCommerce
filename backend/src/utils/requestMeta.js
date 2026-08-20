const axios = require('axios');

function normalizeIp(value = '') {
  return String(value || '')
    .trim()
    .replace(/^::ffff:/i, '');
}

function isLoopback(ip = '') {
  const value = normalizeIp(ip).toLowerCase();
  return !value || value === '127.0.0.1' || value === '::1' || value === 'localhost';
}

/**
 * Best-effort shopper IP from the incoming request.
 * Prefers proxy headers used by Vite, nginx, Cloudflare, etc.
 */
function getClientIp(req) {
  const candidates = [
    req.headers['cf-connecting-ip'],
    req.headers['true-client-ip'],
    req.headers['x-real-ip'],
    ...(String(req.headers['x-forwarded-for'] || '')
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean)),
    req.ip,
    req.socket?.remoteAddress,
    req.connection?.remoteAddress,
  ];

  for (const candidate of candidates) {
    const ip = normalizeIp(candidate);
    if (ip && !isLoopback(ip)) return ip;
  }

  for (const candidate of candidates) {
    const ip = normalizeIp(candidate);
    if (ip) return ip;
  }

  return '127.0.0.1';
}

/** Map User-Agent to BigCommerce order_source values shown in admin. */
function resolveOrderSource(userAgent = '') {
  const ua = String(userAgent || '').toLowerCase();
  if (/ipad/.test(ua)) return 'ipad';
  if (/iphone/.test(ua)) return 'iphone';
  if (/android/.test(ua)) return 'android';
  if (/mobile|opera mini|iemobile|windows phone/.test(ua)) return 'mobile';
  return 'www'; // Desktop in BigCommerce admin
}

/**
 * Localhost checkouts otherwise store 127.0.0.1.
 * Fall back to this machine's public IP so BC admin matches real storefront orders.
 */
async function resolveShopperIp(req) {
  const fromRequest = getClientIp(req);
  if (!isLoopback(fromRequest)) return fromRequest;

  try {
    const response = await axios.get('https://api.ipify.org', {
      params: { format: 'json' },
      timeout: 2500,
    });
    const publicIp = normalizeIp(response.data?.ip);
    if (publicIp && !isLoopback(publicIp)) return publicIp;
  } catch {
    // Keep loopback if the lookup fails.
  }

  return fromRequest;
}

module.exports = {
  getClientIp,
  resolveShopperIp,
  resolveOrderSource,
  normalizeIp,
  isLoopback,
};
