import client from '../api/client';

export const getCompare = (ids) => client.get('/compare', { params: { ids: ids.join(',') } });
