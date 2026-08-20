import axios from 'axios';
import { getSessionId, getToken } from '../utils/session';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
});

client.interceptors.request.use((config) => {
  config.headers['X-Session-Id'] = getSessionId();
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    return Promise.reject(new Error(message));
  }
);

export default client;
