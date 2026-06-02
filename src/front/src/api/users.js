import { api } from './client.js';

export const usersApi = {
  list: () => api.get('/users'),
  create: (data) => api.post('/users', data),
};
