import client from '../api/client';

export const getHome = () => client.get('/home');

export const getProducts = (params) => client.get('/products', { params });

export const getProduct = (id) => client.get(`/products/${id}`);

export const getRelated = (id) => client.get(`/products/${id}/related`);

export const getProductReviews = (id, params) =>
  client.get(`/products/${id}/reviews`, { params });

export const getFeatured = () => client.get('/products/featured');

export const getNewArrivals = () => client.get('/products/new-arrivals');

export const getBestSellers = () => client.get('/products/best-sellers');

export const getCategories = () => client.get('/categories');

export const getCategoryTree = () => client.get('/categories/tree');

export const getCategory = (id) => client.get(`/categories/${id}`);

export const getCategoryProducts = (id, params) =>
  client.get(`/categories/${id}/products`, { params });

export const getBrands = () => client.get('/brands');

export const getBrandProducts = (id, params) =>
  client.get(`/brands/${id}/products`, { params });

export const searchCatalog = (params) => client.get('/search', { params });

export const suggestSearch = (q) => client.get('/search/suggest', { params: { q } });

export const getNavigation = () => client.get('/menus/navigation');
