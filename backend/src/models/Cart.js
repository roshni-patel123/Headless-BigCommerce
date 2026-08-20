function toCart(cartRow, items = []) {
  const mappedItems = items.map((item) => ({
    id: item.id,
    productId: item.product_id,
    variantId: item.variant_id,
    name: item.name,
    sku: item.sku,
    image: item.image,
    price: Number(item.price),
    quantity: item.quantity,
    lineTotal: Number(item.price) * item.quantity,
  }));

  const subtotal = mappedItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const itemCount = mappedItems.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: cartRow.id,
    items: mappedItems,
    itemCount,
    subtotal: Number(subtotal.toFixed(2)),
    shipping: 0,
    total: Number(subtotal.toFixed(2)),
  };
}

module.exports = {
  toCart,
};
