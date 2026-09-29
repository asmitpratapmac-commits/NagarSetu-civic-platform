import api from './axiosInstance';

export const complaintApi = {
  create: (formData) =>
    api.post('/complaints', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  getById: (id) => api.get(`/complaints/${id}`),
  listMine: (params) => api.get('/complaints/mine', { params }),
  listAssignedToMe: (params) => api.get('/complaints/assigned/me', { params }),
  listAll: (params) => api.get('/complaints', { params }),
  assign: (id, payload) => api.post(`/complaints/${id}/assign`, payload),
  updateStatus: (id, payload) => api.patch(`/complaints/${id}/status`, payload),
  uploadResolutionEvidence: (id, formData) =>
    api.post(`/complaints/${id}/resolution-evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  resolve: (id, payload) => api.post(`/complaints/${id}/resolve`, payload),
  verify: (id, payload) => api.post(`/complaints/${id}/verify`, payload),
  comment: (id, payload) => api.post(`/complaints/${id}/comments`, payload),
  overrideStatus: (id, payload) => api.patch(`/complaints/${id}/override-status`, payload),
  overrideSeverity: (id, payload) => api.patch(`/complaints/${id}/override-severity`, payload),
  nearby: (params) => api.get('/complaints/nearby', { params }),
  hotspots: (params) => api.get('/complaints/hotspots', { params }),
  upvote: (id) => api.post(`/complaints/${id}/upvote`),
};
