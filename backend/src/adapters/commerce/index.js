const env = require('../../config/env');
const CommerceProvider = require('./CommerceProvider');
const BigCommerceProvider = require('./BigCommerceProvider');
const ShopifyProvider = require('./ShopifyProvider');

let instance = null;

function getCommerceProvider() {
  if (instance) return instance;

  const engine = (env.commerceEngine || 'bigcommerce').toLowerCase();
  if (engine === 'shopify') {
    instance = new ShopifyProvider();
    return instance;
  }

  instance = new BigCommerceProvider();
  return instance;
}

module.exports = {
  CommerceProvider,
  BigCommerceProvider,
  ShopifyProvider,
  getCommerceProvider,
};
