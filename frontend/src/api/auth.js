import api from './axios';

export const register = (data) => api.post('/users/register/', data);

export const login = (data) => api.post('/users/login/', data);

export const logout = (refresh) => api.post('/users/logout/', { refresh });

export const getProfile = () => api.get('/users/profile/');

export const updateProfile = (data) => api.patch('/users/profile/update/', data);

export const forgotPassword = (email) => api.post('/users/password-reset/', { email });

export const resetPassword = (token, new_password) =>
  api.post(`/users/password-reset/confirm/${token}/`, { new_password });
