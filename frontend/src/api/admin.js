import api from './axios';

const ADMIN_BASE = '/api/v1/admin-panel';

const getAdminEndpoint = (path, page = 1) =>
    api.get(`${ADMIN_BASE}/${path}`, { params: { page } });

export const getAdminDashboard = () => api.get(`${ADMIN_BASE}/dashboard/`);
export const getAdminReports = (page = 1) => getAdminEndpoint('reports/', page);
export const getAdminSessions = (page = 1) => getAdminEndpoint('sessions/', page);
export const getAdminUsers = (page = 1) => getAdminEndpoint('users/', page);

