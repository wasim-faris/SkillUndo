import api from './axios';

export const register = (data) => api.post('/api/v1/auth/register/', data);
export const login = (data) => api.post('/api/v1/auth/login/', data);
export const logout = (refresh) => api.post('/api/v1/auth/logout/', { refresh });
export const getProfile = () => api.get('/api/v1/auth/me/');
export const updateProfile = (data) => api.patch('/api/v1/auth/me/update/', data);
export const forgotPassword = (email) => api.post('/api/v1/auth/password-reset/', { email });
export const resetPassword = (token, new_password, new_confirm_password) =>
  api.post(`/api/v1/auth/reset-password-confirm/${token}/`, { new_password, new_confirm_password });

