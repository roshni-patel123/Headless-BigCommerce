const productService = require('./productService');
const categoryService = require('./categoryService');
const brandService = require('./brandService');
const contentService = require('./contentService');
const { getCache, setCache } = require('../utils/cache');

class SearchService {
  async searchAll(filters) {
    const term = (filters.q || '').trim();
    const cacheKey = `search:${JSON.stringify(filters)}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    const [products, categories, brands, pages, posts] = await Promise.all([
      productService.search(filters),
      categoryService.getAllFlat(),
      brandService.getAll(),
      contentService.getPages().catch(() => []),
      contentService.getBlogPosts({ limit: 20, q: term }).catch(() => ({ data: [] })),
    ]);

    const needle = term.toLowerCase();
    const matchedCategories = categories
      .filter((item) => item.name.toLowerCase().includes(needle))
      .slice(0, 6);
    const matchedBrands = brands
      .filter((item) => item.name.toLowerCase().includes(needle))
      .slice(0, 6);
    const matchedPages = pages
      .filter((page) => page.name.toLowerCase().includes(needle))
      .slice(0, 5);
    const matchedPosts = (posts.data || [])
      .filter((post) => (post.title || '').toLowerCase().includes(needle))
      .slice(0, 5);

    const result = {
      products: products.data,
      meta: products.meta,
      suggestions: {
        categories: matchedCategories,
        brands: matchedBrands,
        pages: matchedPages,
        blog: matchedPosts,
        products: products.data.slice(0, 5).map((p) => ({
          id: p.id,
          name: p.name,
          image: p.image,
          price: p.price,
          inStock: p.inStock !== false,
          hasOptions: Boolean(p.hasOptions)
            || (p.options || []).length > 0
            || (p.variants || []).length > 1,
        })),
      },
    };

    setCache(cacheKey, result, 30000);
    return result;
  }

  async suggest(q = '') {
    if (!q || q.length < 2) {
      return { products: [], categories: [], brands: [], pages: [], blog: [] };
    }
    const result = await this.searchAll({ q, limit: 8, page: 1 });
    return result.suggestions;
  }
}

module.exports = new SearchService();
