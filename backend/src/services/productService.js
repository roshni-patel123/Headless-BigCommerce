const env = require('../config/env');
const { mapProduct, mapProductDetail } = require('../helpers/productMapper');
const demo = require('../helpers/demoCatalog');
const { getCache, setCache } = require('../utils/cache');
const { buildMeta } = require('../utils/pagination');
const { withCatalogFallback } = require('../helpers/catalogFallback');
const bigCommerceService = require('./bigcommerceCatalog');

class ProductService {
  constructor() {
    this.hasStore = Boolean(env.bigcommerce.storeHash && env.bigcommerce.accessToken);
  }

  demoProductList(params) {
    const filtered = demo.filterProducts(params);
    const page = Number(params.page) || 1;
    const limit = Number(params.limit) || 6;
    const start = (page - 1) * limit;
    return {
      data: filtered.slice(start, start + limit).map(mapProduct),
      meta: buildMeta(page, limit, filtered.length),
    };
  }

  async withBrandNames(result) {
    try {
      const brands = await bigCommerceService.fetchBrands();
      return {
        ...result,
        data: bigCommerceService.attachBrandNames(result.data, brands),
      };
    } catch {
      return result;
    }
  }

  async fetchProducts(params) {
    const cacheKey = `products:${JSON.stringify(params)}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    if (!this.hasStore) {
      const data = this.demoProductList(params);
      setCache(cacheKey, data, 30000);
      return data;
    }

    const data = await withCatalogFallback(
      async () => this.withBrandNames(await bigCommerceService.fetchProducts(params)),
      () => this.demoProductList(params)
    );

    setCache(cacheKey, data, 45000);
    return data;
  }

  getAll(filters) {
    return this.fetchProducts(filters);
  }

  async getById(id) {
    const cacheKey = `product:${id}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const fromDemo = () => {
      const found = demo.products.find((item) => item.id === Number(id));
      if (!found) {
        const error = new Error('Product not found');
        error.statusCode = 404;
        throw error;
      }
      return mapProductDetail(found);
    };

    if (!this.hasStore) {
      const mapped = fromDemo();
      setCache(cacheKey, mapped, 60000);
      return mapped;
    }

    const mapped = await withCatalogFallback(async () => {
      const product = await bigCommerceService.fetchProductById(id);
      const [withBrand] = bigCommerceService.attachBrandNames(
        [product],
        await bigCommerceService.fetchBrands()
      );
      return withBrand;
    }, fromDemo);

    setCache(cacheKey, mapped, 60000);
    return mapped;
  }

  search(filters) {
    return this.fetchProducts(filters);
  }

  async getFeatured(limit = 8) {
    const featured = await this.fetchProducts({ featured: true, limit, page: 1 });
    if (featured.data.length) return featured;
    return this.fetchProducts({ limit, page: 1, sort: 'newest' });
  }

  getNewArrivals(limit = 8) {
    return this.fetchProducts({ sort: 'newest', limit, page: 1 });
  }

  async getBestSellers(limit = 8) {
    if (!this.hasStore) {
      return this.fetchProducts({ featured: true, limit, page: 1 });
    }

    return withCatalogFallback(
      async () => this.withBrandNames(
        await bigCommerceService.fetchProducts({ limit, page: 1, sort: 'bestselling' })
      ),
      () => this.fetchProducts({ featured: true, limit, page: 1 })
    );
  }

  async getReviews(productId, filters = {}) {
    if (!this.hasStore) return [];
    return withCatalogFallback(
      () => bigCommerceService.fetchReviews(productId, filters),
      () => []
    );
  }

  async getRelated(id) {
    const product = await this.getById(id);
    if (product.relatedIds?.length) {
      const related = [];
      for (const relatedId of product.relatedIds.slice(0, 4)) {
        if (relatedId > 0) {
          try {
            related.push(await this.getById(relatedId));
          } catch (error) {
            // skip missing related items
          }
        }
      }
      if (related.length) return related;
    }

    const categoryId = product.categories?.[0];
    const list = await this.fetchProducts({ categoryId, limit: 5, page: 1 });
    return list.data.filter((item) => item.id !== Number(id)).slice(0, 4);
  }
}

module.exports = new ProductService();
