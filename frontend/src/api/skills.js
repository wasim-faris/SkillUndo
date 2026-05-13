import api from './axios';

export const getAllSkills = () => api.get('/skills/');

export const getUserSkills = () => api.get('/skills/user/');

export const addSkill = (skill_id, skill_type) =>
  api.post('/skills/user/', { skill_id, skill_type });

export const deleteSkill = (skill_id) => api.delete(`/skills/user/${skill_id}/`);

export const getMatches = () => api.get('/skills/matches/');
