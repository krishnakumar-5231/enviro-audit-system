import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to catch unauthorized errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if expired/invalid
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const userAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`)
};

export const siteAPI = {
  getSites: (params) => api.get('/sites', { params }),
  getSite: (id) => api.get(`/sites/${id}`),
  createSite: (data) => api.post('/sites', data),
  updateSite: (id, data) => api.put(`/sites/${id}`, data),
  deleteSite: (id) => api.delete(`/sites/${id}`)
};

export const auditAPI = {
  getAudits: (params) => api.get('/audits', { params }),
  getAudit: (id) => api.get(`/audits/${id}`),
  createAudit: (data) => api.post('/audits', data),
  updateAudit: (id, data) => api.put(`/audits/${id}`, data),
  deleteAudit: (id) => api.delete(`/audits/${id}`),
  startAudit: (id) => api.post(`/audits/${id}/start`),
  submitAudit: (id) => api.post(`/audits/${id}/submit`),
  completeAudit: (id, data) => api.post(`/audits/${id}/complete`, data)
};

export const inspectionAPI = {
  getInspections: (params) => api.get('/inspections', { params }),
  getInspection: (id) => api.get(`/inspections/${id}`),
  createInspection: (data) => api.post('/inspections', data),
  updateInspectionItems: (id, data) => api.put(`/inspections/${id}`, data),
  submitInspection: (id) => api.post(`/inspections/${id}/submit`),
  uploadEvidence: (id, questionId, formData) =>
    api.post(`/inspections/${id}/items/${questionId}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export const checklistAPI = {
  getChecklists: (params) => api.get('/checklists', { params }),
  getChecklist: (id) => api.get(`/checklists/${id}`),
  createChecklist: (data) => api.post('/checklists', data),
  updateChecklist: (id, data) => api.put(`/checklists/${id}`, data),
  deleteChecklist: (id) => api.delete(`/checklists/${id}`)
};

export const findingAPI = {
  getFindings: (params) => api.get('/findings', { params }),
  getFinding: (id) => api.get(`/findings/${id}`),
  createFinding: (data) => api.post('/findings', data),
  updateFinding: (id, data) => api.put(`/findings/${id}`, data),
  closeFinding: (id, data) => api.post(`/findings/${id}/close`, data),
  uploadEvidence: (id, formData) =>
    api.post(`/findings/${id}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export const capaAPI = {
  getCapas: (params) => api.get('/capa', { params }),
  getCapa: (id) => api.get(`/capa/${id}`),
  createCapa: (data) => api.post('/capa', data),
  updateCapa: (id, data) => api.put(`/capa/${id}`, data),
  submitCapa: (id) => api.post(`/capa/${id}/submit`),
  verifyCapa: (id, data) => api.post(`/capa/${id}/verify`, data),
  closeCapa: (id) => api.post(`/capa/${id}/close`),
  addComment: (id, data) => api.post(`/capa/${id}/comments`, data),
  uploadEvidence: (id, formData) =>
    api.post(`/capa/${id}/evidence`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
};

export const reportAPI = {
  getReports: (params) => api.get('/reports', { params }),
  getReport: (id) => api.get(`/reports/${id}`),
  generateReport: (data) => api.post('/reports/generate', data),
  downloadReportUrl: (id) => `/api/reports/${id}/download`
};

export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all')
};

export const auditLogAPI = {
  getAuditLogs: (params) => api.get('/audit-logs', { params })
};

export const dashboardAPI = {
  getSummary: () => api.get('/dashboard/summary'),
  getAnalytics: () => api.get('/dashboard/analytics')
};

export const settingAPI = {
  getSettings: () => api.get('/settings'),
  updateSettings: (data) => api.put('/settings', data)
};

export default api;
