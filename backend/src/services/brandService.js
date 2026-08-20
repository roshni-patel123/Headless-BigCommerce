const env = require('../config/env');
const { mapBrand } = require('../helpers/productMapper');
const demo = require('../helpers/demoCatalog');
const productService = require('./productService');
const bigCommerceService = require('./bigcommerceCatalog');
const { getCache, setCache } = require('../utils/cache');
const { withCatalogFallback } = require('../helpers/catalogFallback');

class BrandService {
  constructor() {
    this.hasStore = Boolean(env.bigcommerce.storeHash && env.bigcommerce.accessToken);
  }

  fromDemo() {
    return demo.brands.map(mapBrand);
  }

  async getAll() {
    const cached = getCache('brands');
    if (cached) return cached;

    if (!this.hasStore) {
      const data = this.fromDemo();
      setCache('brands', data, 120000);
      return data;
    }

    const data = await withCatalogFallback(
      () => bigCommerceService.fetchBrands(),
      () => this.fromDemo()
    );

    setCache('brands', data, 120000);
    return data;
  }

  async getById(id) {
    const list = await this.getAll();
    const brand = list.find((item) => item.id === Number(id));
    if (!brand) {
      const error = new Error('Brand not found');
      error.statusCode = 404;
      throw error;
    }
    return brand;
  }

  async getProducts(id, filters) {
    const brand = await this.getById(id);
    const products = await productService.getAll({ ...filters, brandId: id });
    return { brand, ...products };
  }
}

module.exports = new BrandService();
