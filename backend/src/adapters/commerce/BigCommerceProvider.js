const CommerceProvider = require('./CommerceProvider');
const catalogRepository = require('../../repositories/bigcommerce/catalogRepository');
const cartRepository = require('../../repositories/bigcommerce/cartRepository');
const checkoutRepository = require('../../repositories/bigcommerce/checkoutRepository');
const contentRepository = require('../../repositories/bigcommerce/contentRepository');
const menuRepository = require('../../repositories/bigcommerce/menuRepository');
const { isConfigured } = require('../../config/bigcommerce');

class BigCommerceProvider extends CommerceProvider {
  getEngineName() {
    return 'bigcommerce';
  }

  isConfigured() {
    return isConfigured();
  }

  getProducts(params) {
    return catalogRepository.getProducts(params);
  }

  getProductById(id) {
    return catalogRepository.getProductById(id);
  }

  getCategories() {
    return catalogRepository.getCategories();
  }

  getBrands() {
    return catalogRepository.getBrands();
  }

  createCart(lineItems) {
    return cartRepository.create(lineItems);
  }

  getCart(cartId) {
    return cartRepository.get(cartId);
  }

  addCartLine(cartId, lineItems) {
    return cartRepository.addLineItems(cartId, lineItems);
  }

  updateCartLine(cartId, itemId, payload) {
    return cartRepository.updateLineItem(cartId, itemId, payload);
  }

  removeCartLine(cartId, itemId) {
    return cartRepository.removeLineItem(cartId, itemId);
  }

  applyCoupon(cartId, couponCode) {
    return cartRepository.applyCoupon(cartId, couponCode);
  }

  removeCoupon(cartId, couponCode) {
    return cartRepository.removeCoupon(cartId, couponCode);
  }

  getCheckout(checkoutId) {
    return checkoutRepository.get(checkoutId);
  }

  updateCheckoutBilling(checkoutId, address, addressId) {
    if (addressId) {
      return checkoutRepository.updateBillingAddress(checkoutId, addressId, address);
    }
    return checkoutRepository.addBillingAddress(checkoutId, address);
  }

  updateCheckoutShipping(checkoutId, consignments, consignmentId, payload) {
    if (consignmentId) {
      return checkoutRepository.updateConsignment(checkoutId, consignmentId, payload);
    }
    return checkoutRepository.addConsignment(checkoutId, consignments);
  }

  selectShippingOption(checkoutId, consignmentId, shippingOptionId) {
    return checkoutRepository.updateConsignment(checkoutId, consignmentId, {
      shipping_option_id: shippingOptionId,
    });
  }

  applyCheckoutCoupon(checkoutId, couponCode) {
    return checkoutRepository.applyCoupon(checkoutId, couponCode);
  }

  applyGiftCertificate(checkoutId, code) {
    return checkoutRepository.applyGiftCertificate(checkoutId, code);
  }

  createOrder(checkoutId) {
    return checkoutRepository.createOrder(checkoutId);
  }

  getStore() {
    return contentRepository.getStore();
  }

  getPages() {
    return contentRepository.getPages();
  }

  getBlogPosts(filters) {
    return contentRepository.getBlogPosts(filters);
  }

  getMenus() {
    return menuRepository.getNavigation();
  }

  getBanners() {
    return menuRepository.getBanners();
  }
}

module.exports = BigCommerceProvider;
