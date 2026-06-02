import { api } from './client.js';

export const patientsApi = {
  list: () => api.get('/patients'),
  get: (id) => api.get(`/patients/${id}`),
  create: (data) => api.post('/patients', data),
  update: (id, data) => api.put(`/patients/${id}`, data),
  activate: (id) => api.put(`/patients/activate/${id}`),
  deactivate: (id) => api.put(`/patients/deactivate/${id}`),
};
