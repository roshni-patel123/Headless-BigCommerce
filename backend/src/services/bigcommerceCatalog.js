/**
 * Thin facade kept for backward-compatible imports.
 * All BigCommerce HTTP lives in repositories; this delegates.
 */
const catalogRepository = require('../repositories/bigcommerce/catalogRepository');
const contentRepository = require('../repositories/bigcommerce/contentRepository');
const cartRepository = require('../repositories/bigcommerce/cartRepository');

class BigCommerceService {
  fetchBrands() {
    return catalogRepository.getBrands();
  }

  fetchCategories() {
    return catalogRepository.getCategories();
  }

  fetchProducts(params) {
    return catalogRepository.getProducts(params);
  }

  fetchProductById(id) {
    return catalogRepository.getProductById(id);
  }

  fetchReviews(productId, filters) {
    return catalogRepository.getProductReviews(productId, filters);
  }

  fetchStore() {
    return contentRepository.getStore();
  }

  fetchPages() {
    return contentRepository.getPages();
  }

  fetchPageById(id) {
    return contentRepository.getPageById(id);
  }

  fetchBlogPosts(filters) {
    return contentRepository.getBlogPosts(filters);
  }

  fetchBlogPostById(id) {
    return contentRepository.getBlogPostById(id);
  }

  async createCheckoutRedirect(lineItems) {
    const cart = await cartRepository.create(lineItems);
    const urls = await cartRepository.createRedirectUrls(cart.id);
    return {
      cartId: cart.id,
      checkoutUrl: urls.checkout_url || urls.embedded_checkout_url || '',
      cartUrl: urls.cart_url || '',
    };
  }

  attachBrandNames(products, brands) {
    const names = Object.fromEntries(brands.map((brand) => [brand.id, brand.name]));
    return products.map((product) => {
      if (!product.brandId) return product;
      return {
        ...product,
        brand: { id: product.brandId, name: names[product.brandId] || product.brand?.name || '' },
      };
    });
  }

  async attachCategoryImages(categories) {
    return Promise.all(
      categories.map(async (category) => {
        if (category.image) return category;
        try {
          const result = await this.fetchProducts({ categoryId: category.id, limit: 1, page: 1 });
          return { ...category, image: result.data[0]?.image || '' };
        } catch {
          return category;
        }
      })
    );
  }

  topLevelCategories(categories) {
    const roots = categories.filter((item) => !item.parentId);
    return roots.length ? roots : categories;
  }
}

module.exports = new BigCommerceService();
