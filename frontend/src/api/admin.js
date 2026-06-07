import api from './axios';

const ADMIN_BASE = '/api/v1/admin-panel';

export const getAdminDashboard = () => api.get(`${ADMIN_BASE}/dashboard/`);
export const getAdminReports = () => api.get(`${ADMIN_BASE}/reports/`);
export const getAdminSessions = () => api.get(`${ADMIN_BASE}/sessions/`);
export const getAdminUsers = () => api.get(`${ADMIN_BASE}/users/`);

