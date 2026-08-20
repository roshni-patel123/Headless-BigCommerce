const { v3 } = require('../../config/bigcommerce');

class WishlistRepository {
  async list(customerId) {
    const response = await v3.get('/wishlists', {
      params: { customer_id: customerId },
    });
    return (response.data.data || []).map((list) => this.mapWishlist(list));
  }

  async create(customerId, name = 'Saved') {
    const response = await v3.post('/wishlists', {
      name,
      is_public: false,
      customer_id: Number(customerId),
      items: [],
    });
    return this.mapWishlist(response.data.data);
  }

  async addItem(wishlistId, productId, variantId) {
    const response = await v3.post(`/wishlists/${wishlistId}/items`, {
      items: [
        {
          product_id: Number(productId),
          variant_id: variantId ? Number(variantId) : undefined,
        },
      ],
    });
    return this.mapWishlist(response.data.data);
  }

  async removeItem(wishlistId, itemId) {
    await v3.delete(`/wishlists/${wishlistId}/items/${itemId}`);
    const response = await v3.get(`/wishlists/${wishlistId}`);
    return this.mapWishlist(response.data.data);
  }

  mapWishlist(list = {}) {
    return {
      id: list.id,
      name: list.name,
      customerId: list.customer_id,
      token: list.token,
      items: (list.items || []).map((item) => ({
        id: item.id,
        productId: item.product_id,
        variantId: item.variant_id,
      })),
    };
  }
}

module.exports = new WishlistRepository();
