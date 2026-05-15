import api from './axios';

export const getAllSkills = () => api.get('/api/v1/skills/');
export const getUserSkills = () => api.get('/api/v1/me/skills/');
export const addSkill = (skill_id, skill_type) =>
  api.post('/api/v1/me/skills/', { skill_id, skill_type });
export const deleteSkill = (skill_id) => api.delete(`/api/v1/me/skills/${skill_id}/`);
export const getMatches = () => api.get('/api/v1/me/matches/');
