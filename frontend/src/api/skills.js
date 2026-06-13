import api from './axios';

// GET  /api/v1/skills/           → all available skills (for dropdown)
export const getAllSkills  = (config = {})             => api.getWithCache('/api/v1/skills/', { cacheTime: 120000, ...config });

// GET  /api/v1/me/skills/        → authenticated user's skills
export const getUserSkills = (config = {})             => api.getWithCache('/api/v1/me/skills/', { cacheTime: 60000, ...config });

// POST /api/v1/me/skills/        → add skill { skill_id, skill_type }
export const addSkill     = (skill_id, skill_type)    => api.post('/api/v1/me/skills/', { skill_id, skill_type });

// DELETE /api/v1/me/skills/{id}/ → id is the UserSkill UUID
export const deleteSkill  = (id)                      => api.delete(`/api/v1/me/skills/${id}/`);

// GET /api/v1/me/matches/        → match feed
export const getMatches   = (config = {})             => api.getWithCache('/api/v1/me/matches/', { cacheTime: 60000, ...config });

// GET /api/v1/auth/user/{userId}/ → fetch public user skills
export const getPublicUserSkills = (userId, config = {}) => api.getWithCache(`/api/v1/auth/user/${userId}/`, { cacheTime: 60000, ...config });

