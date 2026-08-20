const { v3 } = require('../../config/bigcommerce');
const env = require('../../config/env');
const catalogRepository = require('./catalogRepository');
const contentRepository = require('./contentRepository');

class MenuRepository {
  async getChannelMenus() {
    const channelId = env.bigcommerce.channelId || 1;
    try {
      const response = await v3.get(`/channels/${channelId}/site/routes`);
      return response.data.data || [];
    } catch {
      return [];
    }
  }

  /**
   * Build storefront navigation from categories + CMS pages.
   * Channel menu tree APIs vary by plan; this yields a reliable mega-menu structure.
   */
  async getNavigation() {
    const [categories, pages, blogPosts] = await Promise.all([
      catalogRepository.getCategories(),
      contentRepository.getPages().catch(() => []),
      contentRepository.getBlogPosts({ limit: 1 }).catch(() => []),
    ]);

    const byParent = new Map();
    categories.forEach((category) => {
      const parent = category.parentId || 0;
      if (!byParent.has(parent)) byParent.set(parent, []);
      byParent.get(parent).push(category);
    });

    function childrenOf(parentId) {
      return (byParent.get(parentId) || []).map((category) => ({
        id: `cat-${category.id}`,
        type: 'category',
        label: category.name,
        href: `/category/${category.id}`,
        children: childrenOf(category.id),
      }));
    }

    const shopChildren = childrenOf(0);
    const pageLinks = pages
      .filter((page) => page.isVisible)
      .slice(0, 8)
      .map((page) => ({
        id: `page-${page.id}`,
        type: 'page',
        label: page.name,
        href: `/pages/${page.id}`,
        children: [],
      }));

    const items = [
      {
        id: 'shop',
        type: 'custom',
        label: 'Shop All',
        href: '/products',
        children: shopChildren,
      },
      {
        id: 'blog',
        type: 'blog',
        label: 'Blog',
        href: '/blog',
        children: [],
        enabled: blogPosts.length > 0 || true,
      },
      ...pageLinks,
    ];

    return {
      items,
      categories: shopChildren,
      pages: pageLinks,
    };
  }

  async getBanners() {
    // Prefer marketing banners when available; fall back to empty for homepage builder.
    try {
      const response = await v3.get('/marketing/banners', { params: { limit: 20 } });
      return (response.data.data || []).map((banner) => ({
        id: banner.id,
        name: banner.name,
        content: banner.content || banner.item || '',
        page: banner.page || '',
        location: banner.location || '',
        dateCreated: banner.date_created,
      }));
    } catch {
      return [];
    }
  }
}

module.exports = new MenuRepository();
