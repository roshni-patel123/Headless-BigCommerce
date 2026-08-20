const env = require('../config/env');
const wishlistRepository = require('../repositories/wishlistRepository');
const bcWishlistRepository = require('../repositories/bigcommerce/wishlistRepository');
const customerRepository = require('../repositories/customerRepository');
const productService = require('./productService');

class WishlistService {
  constructor() {
    this.hasStore = Boolean(env.bigcommerce.storeHash && env.bigcommerce.accessToken);
  }

  async resolveBcCustomerId(customerId) {
    if (!customerId || !this.hasStore) return null;
    const customer = await customerRepository.findById(customerId);
    return customer?.bcCustomerId || null;
  }

  async ensureBcWishlist(bcCustomerId) {
    const lists = await bcWishlistRepository.list(bcCustomerId);
    if (lists.length) return lists[0];
    return bcWishlistRepository.create(bcCustomerId, 'Saved');
  }

  async enrichItems(items) {
    return Promise.all(
      items.map(async (item) => {
        try {
          const product = await productService.getById(item.productId);
          return {
            ...item,
            name: product.name,
            price: product.price,
            image: product.image,
            hoverImage: product.hoverImage || product.images?.[1]?.url || '',
            brand: product.brand?.name || '',
            inStock: product.inStock !== false,
            hasOptions: Boolean(product.hasOptions),
            options: product.options || [],
            variants: product.variants || [],
            rating: product.rating,
          };
        } catch {
          return item;
        }
      })
    );
  }

  async getWishlist({ customerId, sessionId }) {
    const bcCustomerId = await this.resolveBcCustomerId(customerId);
    if (bcCustomerId) {
      const list = await this.ensureBcWishlist(bcCustomerId);
      return this.enrichItems(list.items || []);
    }
    const items = await wishlistRepository.list({ customerId, sessionId });
    return this.enrichItems(items);
  }

  async addItem({ customerId, sessionId, productId, variantId }) {
    const bcCustomerId = await this.resolveBcCustomerId(customerId);
    if (bcCustomerId) {
      const list = await this.ensureBcWishlist(bcCustomerId);
      const exists = (list.items || []).some(
        (item) => Number(item.productId) === Number(productId)
      );
      if (!exists) {
        await bcWishlistRepository.addItem(list.id, productId, variantId);
      }
      return this.getWishlist({ customerId, sessionId });
    }

    const existing = await wishlistRepository.findOne({ customerId, sessionId, productId });
    if (existing) {
      return this.getWishlist({ customerId, sessionId });
    }

    const product = await productService.getById(productId);
    await wishlistRepository.add({
      customerId: customerId || null,
      sessionId: customerId ? null : sessionId,
      productId,
      name: product.name,
      price: product.price,
      image: product.image,
      brand: product.brand?.name || '',
    });
    return this.getWishlist({ customerId, sessionId });
  }

  async removeItem({ customerId, sessionId, productId }) {
    const bcCustomerId = await this.resolveBcCustomerId(customerId);
    if (bcCustomerId) {
      const list = await this.ensureBcWishlist(bcCustomerId);
      const item = (list.items || []).find(
        (row) => Number(row.productId) === Number(productId)
      );
      if (item) {
        await bcWishlistRepository.removeItem(list.id, item.id);
      }
      return this.getWishlist({ customerId, sessionId });
    }

    await wishlistRepository.remove({ customerId, sessionId, productId });
    return this.getWishlist({ customerId, sessionId });
  }
}

module.exports = new WishlistService();
