function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.warn(`Missing environment variable: ${name}`);
  }
  return value || '';
}

const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  databaseUrl: requireEnv('DATABASE_URL'),
  jwtSecret: requireEnv('JWT_SECRET') || 'dev-only-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  redisUrl: process.env.REDIS_URL || '',
  commerceEngine: process.env.COMMERCE_ENGINE || 'bigcommerce',
  bigcommerce: {
    storeHash: requireEnv('BIGCOMMERCE_STORE_HASH'),
    accessToken: requireEnv('BIGCOMMERCE_ACCESS_TOKEN'),
    clientId: process.env.BIGCOMMERCE_CLIENT_ID || '',
    channelId: process.env.BIGCOMMERCE_CHANNEL_ID || '',
    storefrontToken: process.env.BIGCOMMERCE_STOREFRONT_TOKEN || '',
    apiUrl: process.env.BIGCOMMERCE_API_URL || '',
  },
};

env.bigcommerce.isConfigured = Boolean(
  env.bigcommerce.storeHash && env.bigcommerce.accessToken
);

module.exports = env;
