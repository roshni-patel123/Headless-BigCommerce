const env = require('../config/env');
const bigCommerceService = require('./bigcommerceCatalog');

class CatalogService {
  isConfigured() {
    return Boolean(env.bigcommerce.storeHash && env.bigcommerce.accessToken);
  }

  async getStatus() {
    if (!this.isConfigured()) {
      return {
        connected: false,
        source: 'demo',
        message: 'Add BIGCOMMERCE_STORE_HASH and BIGCOMMERCE_ACCESS_TOKEN to backend/.env',
      };
    }

    try {
      const snapshot = await this.checkConnection();
      return {
        connected: true,
        source: 'bigcommerce',
        storeHash: env.bigcommerce.storeHash,
        productCount: snapshot.productCount,
        categoryCount: snapshot.categoryCount,
      };
    } catch (error) {
      return {
        connected: false,
        source: 'demo',
        storeHash: env.bigcommerce.storeHash,
        message: error.message,
        hint: 'Create a new API account with read access to Products, Categories, and Brands. Paste the Access Token (not the Client ID).',
      };
    }
  }

  async checkConnection() {
    if (!this.isConfigured()) {
      const error = new Error('Missing BIGCOMMERCE_STORE_HASH or BIGCOMMERCE_ACCESS_TOKEN');
      error.statusCode = 400;
      throw error;
    }

    const [products, categories] = await Promise.all([
      bigCommerceService.fetchProducts({ limit: 5, page: 1 }),
      bigCommerceService.fetchCategories(),
    ]);

    return {
      productCount: products.meta.total,
      categoryCount: categories.length,
      products: products.data,
      categories,
    };
  }
}

module.exports = new CatalogService();
