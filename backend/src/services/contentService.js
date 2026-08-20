const env = require('../config/env');
const contentRepository = require('../repositories/bigcommerce/contentRepository');
const { getCache, setCache } = require('../utils/cache');
const { withCatalogFallback } = require('../helpers/catalogFallback');

class ContentService {
  constructor() {
    this.hasStore = Boolean(env.bigcommerce.storeHash && env.bigcommerce.accessToken);
  }

  async getStore() {
    const cached = getCache('store:info');
    if (cached) return cached;

    if (!this.hasStore) {
      return {
        name: 'VELORA',
        domain: '',
        secureUrl: '',
        currency: 'USD',
        phone: '',
        address: '',
        adminEmail: 'hello@velora.store',
      };
    }

    const data = await withCatalogFallback(
      () => contentRepository.getStore(),
      () => ({
        name: 'VELORA',
        domain: '',
        secureUrl: '',
        currency: 'USD',
        phone: '',
        address: '',
        adminEmail: 'hello@velora.store',
      })
    );

    setCache('store:info', data, 300000);
    return data;
  }

  async getPages() {
    const cached = getCache('content:pages');
    if (cached) return cached;

    if (!this.hasStore) return [];

    const data = await withCatalogFallback(
      async () => {
        const pages = await contentRepository.getPages();
        return pages.filter((page) => page.isVisible && page.type !== 'link');
      },
      () => []
    );

    setCache('content:pages', data, 180000);
    return data;
  }

  async getPageById(id) {
    const pages = await this.getPages();
    const fromList = pages.find((page) => String(page.id) === String(id) || page.slug === String(id));
    if (fromList?.body) return fromList;

    if (!this.hasStore) {
      const error = new Error('Page not found');
      error.statusCode = 404;
      throw error;
    }

    try {
      return await contentRepository.getPageById(id);
    } catch {
      const error = new Error('Page not found');
      error.statusCode = 404;
      throw error;
    }
  }

  async getBlogPosts(filters = {}) {
    const cacheKey = `blog:${JSON.stringify(filters)}`;
    const cached = getCache(cacheKey);
    if (cached) return cached;

    if (!this.hasStore) {
      return { data: [], meta: { page: 1, total: 0, totalPages: 1 } };
    }

    const page = Number(filters.page) || 1;
    const limit = Number(filters.limit) || 12;

    const data = await withCatalogFallback(
      async () => {
        const posts = await contentRepository.getBlogPosts({
          page,
          limit,
          tag: filters.tag,
        });
        return {
          data: posts,
          meta: {
            page,
            limit,
            total: posts.length,
            totalPages: posts.length < limit ? page : page + 1,
          },
        };
      },
      () => ({ data: [], meta: { page: 1, total: 0, totalPages: 1 } })
    );

    setCache(cacheKey, data, 120000);
    return data;
  }

  async getBlogPostById(id) {
    if (!this.hasStore) {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }

    try {
      return await contentRepository.getBlogPostById(id);
    } catch {
      const error = new Error('Post not found');
      error.statusCode = 404;
      throw error;
    }
  }

  async getBlogTags() {
    const cached = getCache('blog:tags');
    if (cached) return cached;
    if (!this.hasStore) return [];
    const tags = await contentRepository.getBlogTags().catch(() => []);
    setCache('blog:tags', tags, 300000);
    return tags;
  }

  async getRedirects() {
    const cached = getCache('content:redirects');
    if (cached) return cached;
    if (!this.hasStore) return [];
    const redirects = await contentRepository.getRedirects().catch(() => []);
    setCache('content:redirects', redirects, 600000);
    return redirects;
  }
}

module.exports = new ContentService();
