const { v2, v3 } = require('../../config/bigcommerce');

class ContentRepository {
  async getStore() {
    const response = await v2.get('/store');
    const store = response.data || {};
    return {
      name: store.name || 'VELORA',
      domain: store.domain || '',
      secureUrl: store.secure_url || '',
      currency: store.currency || 'USD',
      language: store.language || 'en',
      phone: store.phone || '',
      address: store.address || '',
      adminEmail: store.admin_email || '',
      logo: store.logo?.url || '',
      metaDescription: store.meta_description || '',
      facebook: store.facebook_url || '',
      twitter: store.twitter_url || '',
    };
  }

  mapPage(page = {}) {
    const url = page.url || page.custom_url?.url || '';
    const slug = String(url).replace(/^\/+|\/+$/g, '') || String(page.id);
    return {
      id: page.id,
      name: page.name || page.title || 'Page',
      slug,
      url,
      type: page.type || 'page',
      isVisible: page.is_visible !== false,
      metaTitle: page.meta_title || page.name || '',
      metaDescription: page.meta_description || '',
      body: page.body || page.content || '',
      parentId: page.parent_id || null,
      sortOrder: page.sort_order || 0,
    };
  }

  mapBlogPost(post = {}) {
    return {
      id: post.id,
      title: post.title || 'Untitled',
      url: post.url || '',
      summary: post.summary || '',
      body: post.body || '',
      thumbnail: post.thumbnail_path || '',
      author: post.author || '',
      tags: post.tags || [],
      publishedAt: post.published_date?.date || post.published_date || null,
      isPublished: post.is_published !== false,
      metaTitle: post.meta_title || post.title || '',
      metaDescription: post.meta_description || post.summary || '',
    };
  }

  async getPages() {
    try {
      const response = await v3.get('/content/pages', {
        params: { limit: 50, include: 'body' },
      });
      return (response.data.data || []).map((page) => this.mapPage(page));
    } catch {
      const response = await v2.get('/pages');
      const rows = Array.isArray(response.data) ? response.data : [];
      return rows.map((page) => this.mapPage(page));
    }
  }

  async getPageById(id) {
    try {
      const response = await v3.get(`/content/pages/${id}`, {
        params: { include: 'body' },
      });
      return this.mapPage(response.data.data);
    } catch {
      const response = await v2.get(`/pages/${id}`);
      return this.mapPage(response.data);
    }
  }

  async getBlogPosts({ page = 1, limit = 12, tag } = {}) {
    const response = await v2.get('/blog/posts', {
      params: {
        is_published: true,
        page,
        limit,
        tag: tag || undefined,
      },
    });
    const rows = Array.isArray(response.data) ? response.data : [];
    return rows.map((post) => this.mapBlogPost(post));
  }

  async getBlogPostById(id) {
    const response = await v2.get(`/blog/posts/${id}`);
    return this.mapBlogPost(response.data);
  }

  async getBlogTags() {
    try {
      const response = await v2.get('/blog/tags');
      const rows = Array.isArray(response.data) ? response.data : [];
      return rows.map((tag) => ({
        name: tag.name || tag.tag || tag,
        postCount: tag.post_count || 0,
      }));
    } catch {
      return [];
    }
  }

  async getRedirects() {
    try {
      const response = await v3.get('/storefront/redirects', { params: { limit: 250 } });
      return response.data.data || [];
    } catch {
      return [];
    }
  }
}

module.exports = new ContentRepository();
