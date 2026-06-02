import { api } from './client.js';

export const medicationsApi = {
  list: () => api.get('/medications'),
  get: (id) => api.get(`/medications/${id}`),
  create: (data) => api.post('/medications', data),
  update: (id, data) => api.put(`/medications/${id}`, data),
  remove: (id) => api.del(`/medications/${id}`),
};
