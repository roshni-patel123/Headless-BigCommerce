/**
 * Commerce engine interface — implement for BigCommerce, Shopify, Woo, etc.
 * Domain services should depend on this shape via getCommerceProvider().
 */
class CommerceProvider {
  getEngineName() {
    throw new Error('Not implemented');
  }

  isConfigured() {
    throw new Error('Not implemented');
  }

  // Catalog
  getProducts() { throw new Error('Not implemented'); }
  getProductById() { throw new Error('Not implemented'); }
  getCategories() { throw new Error('Not implemented'); }
  getBrands() { throw new Error('Not implemented'); }

  // Cart
  createCart() { throw new Error('Not implemented'); }
  getCart() { throw new Error('Not implemented'); }
  addCartLine() { throw new Error('Not implemented'); }
  updateCartLine() { throw new Error('Not implemented'); }
  removeCartLine() { throw new Error('Not implemented'); }
  applyCoupon() { throw new Error('Not implemented'); }
  removeCoupon() { throw new Error('Not implemented'); }

  // Checkout
  getCheckout() { throw new Error('Not implemented'); }
  updateCheckoutBilling() { throw new Error('Not implemented'); }
  updateCheckoutShipping() { throw new Error('Not implemented'); }
  selectShippingOption() { throw new Error('Not implemented'); }
  applyCheckoutCoupon() { throw new Error('Not implemented'); }
  applyGiftCertificate() { throw new Error('Not implemented'); }
  createOrder() { throw new Error('Not implemented'); }

  // Content / nav
  getStore() { throw new Error('Not implemented'); }
  getPages() { throw new Error('Not implemented'); }
  getBlogPosts() { throw new Error('Not implemented'); }
  getMenus() { throw new Error('Not implemented'); }
  getBanners() { throw new Error('Not implemented'); }
}

module.exports = CommerceProvider;
