import api from './axios';

// GET  /api/v1/skills/           → all available skills (for dropdown)
export const getAllSkills  = ()                        => api.get('/api/v1/skills/');

// GET  /api/v1/me/skills/        → authenticated user's skills
export const getUserSkills = ()                        => api.get('/api/v1/me/skills/');

// POST /api/v1/me/skills/        → add skill { skill_id, skill_type }
export const addSkill     = (skill_id, skill_type)    => api.post('/api/v1/me/skills/', { skill_id, skill_type });

// DELETE /api/v1/me/skills/{id}/ → id is the UserSkill UUID
export const deleteSkill  = (id)                      => api.delete(`/api/v1/me/skills/${id}/`);

// GET /api/v1/me/matches/        → match feed
export const getMatches   = ()                        => api.get('/api/v1/me/matches/');

// GET /api/v1/sessions/user/{userId}/ → fetch public user skills
export const getPublicUserSkills = (userId)           => api.get(`/api/v1/sessions/user/${userId}/`);

