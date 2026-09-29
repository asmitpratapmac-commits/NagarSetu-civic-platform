import api from './axiosInstance';

export const departmentApi = {
  list: () => api.get('/departments'),
  getById: (id) => api.get(`/departments/${id}`),
  create: (payload) => api.post('/departments', payload),
  update: (id, payload) => api.patch(`/departments/${id}`, payload),
  remove: (id) => api.delete(`/departments/${id}`),
  refreshPerformance: (id) => api.post(`/departments/${id}/refresh-performance`),
};

export const userApi = {
  updateProfile: (payload) => api.patch('/users/me', payload),
  list: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  setActiveStatus: (id, isActive) => api.patch(`/users/${id}/active-status`, { isActive }),
  updateRole: (id, payload) => api.patch(`/users/${id}/role`, payload),
  listByDepartment: (departmentId) => api.get(`/users/department/${departmentId}`),
};

export const notificationApi = {
  list: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
};

export const analyticsApi = {
  adminSummary: () => api.get('/analytics/admin/summary'),
  trend: (days) => api.get('/analytics/admin/trend', { params: { days } }),
  categoryDistribution: () => api.get('/analytics/admin/category-distribution'),
  severityDistribution: () => api.get('/analytics/admin/severity-distribution'),
  departmentPerformance: () => api.get('/analytics/admin/department-performance'),
  aiStats: () => api.get('/analytics/admin/ai-stats'),
  authoritySummary: () => api.get('/analytics/authority/summary'),
  citizenSummary: () => api.get('/analytics/citizen/summary'),
};

export const announcementApi = {
  list: () => api.get('/announcements'),
  create: (payload) => api.post('/announcements', payload),
  deactivate: (id) => api.patch(`/announcements/${id}/deactivate`),
};

export const settingsApi = {
  get: () => api.get('/settings'),
  update: (payload) => api.patch('/settings', payload),
};

export const aiApi = {
  detectImage: (formData) =>
    api.post('/ai/detect-image', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  health: () => api.get('/ai/health'),
};

export const auditLogApi = {
  list: (params) => api.get('/audit-logs', { params }),
};
