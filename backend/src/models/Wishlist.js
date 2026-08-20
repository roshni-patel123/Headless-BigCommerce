function toWishlistItem(row) {
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    price: Number(row.price),
    image: row.image,
    brand: row.brand,
    createdAt: row.created_at,
  };
}

module.exports = {
  toWishlistItem,
};
