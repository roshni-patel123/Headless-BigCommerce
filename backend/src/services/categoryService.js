const env = require('../config/env');
const { mapCategory } = require('../helpers/productMapper');
const demo = require('../helpers/demoCatalog');
const productService = require('./productService');
const bigCommerceService = require('./bigcommerceCatalog');
const { getCache, setCache } = require('../utils/cache');
const { withCatalogFallback } = require('../helpers/catalogFallback');

class CategoryService {
  constructor() {
    this.hasStore = Boolean(env.bigcommerce.storeHash && env.bigcommerce.accessToken);
  }

  fromDemo() {
    return demo.categories.map(mapCategory);
  }

  buildTree(categories) {
    const byParent = new Map();
    categories.forEach((category) => {
      const parent = category.parentId || 0;
      if (!byParent.has(parent)) byParent.set(parent, []);
      byParent.get(parent).push(category);
    });

    function nest(parentId) {
      return (byParent.get(parentId) || []).map((category) => ({
        ...category,
        children: nest(category.id),
      }));
    }

    return nest(0);
  }

  async getAllFlat() {
    const cached = getCache('categories:flat');
    if (cached) return cached;

    if (!this.hasStore) {
      const data = this.fromDemo();
      setCache('categories:flat', data, 120000);
      return data;
    }

    const data = await withCatalogFallback(
      () => bigCommerceService.fetchCategories(),
      () => this.fromDemo()
    );

    setCache('categories:flat', data, 120000);
    return data;
  }

  async getAll() {
    const cached = getCache('categories');
    if (cached) return cached;

    const flat = await this.getAllFlat();
    const top = bigCommerceService.topLevelCategories(flat);
    const data = await withCatalogFallback(
      () => bigCommerceService.attachCategoryImages(top),
      () => top
    );

    setCache('categories', data, 120000);
    return data;
  }

  async getTree() {
    const cached = getCache('categories:tree');
    if (cached) return cached;
    const flat = await this.getAllFlat();
    const tree = this.buildTree(flat);
    setCache('categories:tree', tree, 120000);
    return tree;
  }

  async getById(id) {
    const flat = await this.getAllFlat();
    let category = flat.find((item) => item.id === Number(id));

    if (!category && this.hasStore) {
      try {
        const all = await bigCommerceService.fetchCategories();
        category = all.find((item) => item.id === Number(id));
      } catch {
        category = null;
      }
    }

    if (!category) {
      category = this.fromDemo().find((item) => item.id === Number(id));
    }

    if (!category) {
      const error = new Error('Category not found');
      error.statusCode = 404;
      throw error;
    }

    if (!category.image) {
      [category] = await bigCommerceService.attachCategoryImages([category]);
    }

    const children = flat.filter((item) => item.parentId === category.id);
    return { ...category, children };
  }

  async getProducts(id, filters) {
    const category = await this.getById(id);
    const products = await productService.getAll({ ...filters, categoryId: id });
    return { category, ...products };
  }
}

module.exports = new CategoryService();
