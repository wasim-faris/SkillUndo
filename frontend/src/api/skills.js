import api from './axios';

// GET  /api/v1/skills/           → all available skills (for dropdown)
export const getAllSkills  = ()                        => api.get('/api/v1/skills/');

// GET  /api/v1/skills/my/        → authenticated user's skills
export const getUserSkills = ()                        => api.get('/api/v1/skills/my/');

// POST /api/v1/skills/my/        → add skill { skill_id, skill_type }
export const addSkill     = (skill_id, skill_type)    => api.post('/api/v1/skills/my/', { skill_id, skill_type });

// DELETE /api/v1/skills/my/{id}/ → id is the UserSkill UUID
export const deleteSkill  = (id)                      => api.delete(`/api/v1/skills/my/${id}/`);

// GET /api/v1/me/matches/        → match feed
export const getMatches   = ()                        => api.get('/api/v1/me/matches/');
