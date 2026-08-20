import client from '../api/client';

export const loginCustomer = (payload) => client.post('/customers/login', payload);

export const registerCustomer = (payload) => client.post('/customers/register', payload);

export const getProfile = () => client.get('/customers/profile');

export const updateProfile = (payload) => client.patch('/customers/profile', payload);

export const getAddresses = () => client.get('/customers/addresses');

export const createAddress = (payload) => client.post('/customers/addresses', payload);

export const updateAddress = (id, payload) => client.put(`/customers/addresses/${id}`, payload);

export const deleteAddress = (id) => client.delete(`/customers/addresses/${id}`);

export const getOrders = () => client.get('/customers/orders');

export const subscribeNewsletter = (email) => client.post('/newsletter', { email });
