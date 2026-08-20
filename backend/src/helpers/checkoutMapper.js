const { money, mapCart } = require('./cartMapper');

function mapAddress(address = {}) {
  if (!address || (!address.id && !address.email && !address.address1)) return null;
  return {
    id: address.id,
    email: address.email || '',
    firstName: address.first_name || '',
    lastName: address.last_name || '',
    company: address.company || '',
    address1: address.address1 || '',
    address2: address.address2 || '',
    city: address.city || '',
    stateOrProvince: address.state_or_province || '',
    stateOrProvinceCode: address.state_or_province_code || '',
    countryCode: address.country_code || '',
    postalCode: address.postal_code || '',
    phone: address.phone || '',
  };
}

function mapShippingOption(option = {}) {
  return {
    id: option.id,
    type: option.type,
    description: option.description,
    imageUrl: option.image_url || '',
    cost: money(option.cost),
    transitTime: option.transit_time || '',
  };
}

function mapConsignment(consignment = {}) {
  return {
    id: consignment.id,
    shippingAddress: mapAddress(consignment.shipping_address),
    selectedShippingOption: consignment.selected_shipping_option
      ? mapShippingOption(consignment.selected_shipping_option)
      : null,
    availableShippingOptions: (consignment.available_shipping_options || []).map(mapShippingOption),
    shippingCost: money(consignment.shipping_cost_total_inc_tax ?? consignment.shipping_cost_total_ex_tax),
  };
}

function mapCheckout(checkout = {}) {
  const checkoutCoupons = (checkout.coupons || []).map((coupon) => ({
    code: coupon.code,
    id: coupon.id,
    display_name: coupon.display_name || coupon.code,
    discounted_amount: coupon.discounted_amount,
  }));

  const cart = checkout.cart
    ? mapCart(checkout.cart, {
        coupons: checkoutCoupons,
        cartAmount: checkout.cart.cart_amount,
      })
    : null;

  const coupons = checkoutCoupons.map((coupon) => ({
    code: coupon.code,
    id: coupon.id,
    displayName: coupon.display_name || coupon.code,
    discountAmount: money(coupon.discounted_amount),
  }));

  return {
    id: checkout.id,
    cartId: checkout.cart?.id || checkout.id,
    cart: cart
      ? {
          ...cart,
          coupons: coupons.length ? coupons : cart.coupons,
          discountAmount: money(
            Math.max(
              cart.discountAmount || 0,
              Number(checkout.discount_amount) || 0,
              coupons.reduce((sum, item) => sum + (item.discountAmount || 0), 0)
            )
          ),
          total: money(checkout.cart?.cart_amount ?? cart.cartAmount ?? cart.total),
          cartAmount: money(checkout.cart?.cart_amount ?? cart.cartAmount ?? cart.total),
        }
      : null,
    billingAddress: mapAddress(checkout.billing_address),
    consignments: (checkout.consignments || []).map(mapConsignment),
    coupons,
    giftCertificates: (checkout.gift_certificates || []).map((cert) => ({
      code: cert.code,
      balance: money(cert.balance),
      used: money(cert.used),
      remaining: money(cert.remaining),
    })),
    taxes: (checkout.taxes || []).map((tax) => ({
      name: tax.name,
      amount: money(tax.amount),
    })),
    subtotal: money(checkout.subtotal_inc_tax ?? checkout.subtotal_ex_tax),
    shippingCost: money(checkout.shipping_cost_total_inc_tax ?? checkout.shipping_cost_total_ex_tax),
    taxTotal: money(checkout.tax_total),
    discountAmount: money(checkout.discount_amount || checkout.cart?.discount_amount),
    grandTotal: money(checkout.grand_total),
    customerMessage: checkout.customer_message || '',
    promotions: checkout.promotions || [],
  };
}

function toBcAddress(input = {}) {
  return {
    email: input.email,
    first_name: input.firstName,
    last_name: input.lastName,
    company: input.company || '',
    address1: input.address1,
    address2: input.address2 || '',
    city: input.city,
    state_or_province: input.stateOrProvince || '',
    state_or_province_code: input.stateOrProvinceCode || '',
    country_code: input.countryCode || 'US',
    postal_code: input.postalCode,
    phone: input.phone || '',
  };
}

module.exports = {
  mapCheckout,
  mapAddress,
  mapShippingOption,
  toBcAddress,
};
