import client from '../api/client';

export const getStore = () => client.get('/content/store');

export const getPages = () => client.get('/content/pages');

export const getPage = (id) => client.get(`/content/pages/${id}`);

export const getBlogPosts = (params) => client.get('/content/blog', { params });

export const getBlogPost = (id) => client.get(`/content/blog/${id}`);

export const getBlogTags = () => client.get('/content/blog/tags');

export const getRedirects = () => client.get('/content/redirects');
