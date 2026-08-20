const CommerceProvider = require('./CommerceProvider');

/**
 * Placeholder Shopify adapter — implement Storefront/Admin API mapping later.
 * Keeps the multi-engine interface stable without shipping a second engine yet.
 */
class ShopifyProvider extends CommerceProvider {
  getEngineName() {
    return 'shopify';
  }

  isConfigured() {
    return false;
  }
}

module.exports = ShopifyProvider;
