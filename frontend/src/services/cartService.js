import client from '../api/client';

export const fetchCart = () => client.get('/cart');

export const addCartItem = (payload) => client.post('/cart/items', payload);

export const updateCartItem = (itemId, quantity) =>
  client.patch(`/cart/items/${itemId}`, { quantity });

export const removeCartItem = (itemId) => client.delete(`/cart/items/${itemId}`);

export const applyCoupon = (couponCode) =>
  client.post('/cart/coupons', { couponCode });

export const removeCoupon = (code) => client.delete(`/cart/coupons/${encodeURIComponent(code)}`);
