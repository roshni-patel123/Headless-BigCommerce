function money(value) {
  return Number(Number(value || 0).toFixed(2));
}

function mapPhysicalItem(item) {
  return {
    id: item.id,
    productId: item.product_id,
    variantId: item.variant_id || null,
    sku: item.sku || '',
    name: item.name,
    image: item.image_url || '',
    quantity: item.quantity,
    price: money(item.sale_price ?? item.list_price),
    listPrice: money(item.list_price),
    salePrice: money(item.sale_price),
    lineTotal: money(item.extended_sale_price ?? item.extended_list_price),
    options: (item.options || []).map((option) => ({
      name: option.name,
      value: option.value,
      nameId: option.nameId,
      valueId: option.valueId,
    })),
  };
}

function mapCart(cart = {}, checkoutExtras = {}) {
  const physical = cart.line_items?.physical_items || [];
  const digital = cart.line_items?.digital_items || [];
  const items = [...physical, ...digital].map(mapPhysicalItem);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const rawCoupons = checkoutExtras.coupons?.length
    ? checkoutExtras.coupons
    : cart.coupons || [];

  const coupons = rawCoupons.map((coupon) => ({
    code: coupon.code,
    id: coupon.id,
    displayName: coupon.display_name || coupon.displayName || coupon.code,
    discountAmount: money(coupon.discounted_amount ?? coupon.discountAmount),
  }));

  // BC returns per-item discount rows; collapse into one entry per unique discount name.
  // cart.discount_amount excludes coupon discounts — those live on coupons[].discounted_amount.
  const couponCodes = new Set(
    coupons.map((c) => String(c.code || c.displayName || '').toLowerCase()).filter(Boolean)
  );
  const discountMap = new Map();
  (cart.discounts || []).forEach((discount) => {
    const amount = money(discount.discounted_amount ?? discount.amount);
    if (!amount) return;
    const name = discount.name || 'Discount';
    const key = name.toLowerCase();
    if (couponCodes.has(key)) return;
    if (discountMap.has(key)) {
      discountMap.get(key).amount += amount;
    } else {
      discountMap.set(key, { id: key, name, amount });
    }
  });
  const discounts = Array.from(discountMap.values()).map((d) => ({
    ...d,
    amount: money(d.amount),
  }));

  const couponDiscount = coupons.reduce((sum, coupon) => sum + (coupon.discountAmount || 0), 0);
  const promotionDiscount = discounts.reduce((sum, discount) => sum + (discount.amount || 0), 0);
  // Manual/order discounts only in discount_amount; add coupon + promo amounts for UI total.
  const discountAmount = money(
    (Number(cart.discount_amount) || 0) + couponDiscount + promotionDiscount
  );

  const subtotal = money(cart.base_amount);
  const cartAmount = money(
    cart.cart_amount
      ?? checkoutExtras.cartAmount
      ?? Math.max(0, subtotal - discountAmount)
  );

  return {
    id: cart.id,
    currency: cart.currency?.code || 'USD',
    items,
    itemCount,
    coupons,
    discounts,
    subtotal,
    discountAmount,
    cartAmount,
    taxTotal: 0,
    shipping: 0,
    total: cartAmount,
    email: cart.email || '',
    customerId: cart.customer_id || null,
  };
}

module.exports = {
  mapCart,
  mapPhysicalItem,
  money,
};
