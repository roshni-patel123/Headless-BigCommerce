import client from '../api/client';

export const fetchWishlist = () => client.get('/wishlist');

export const addWishlistItem = (productId) => client.post('/wishlist', { productId });

export const removeWishlistItem = (productId) => client.delete(`/wishlist/${productId}`);
