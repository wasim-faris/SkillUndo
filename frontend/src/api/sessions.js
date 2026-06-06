import api from './axios';

export const getMySessions = (status) =>
  api.get('/api/v1/sessions/my/', {
    params: status && status !== 'all' ? { status } : undefined,
  });

export const getSessionDetail = (sessionId) =>
  api.get(`/api/v1/sessions/${sessionId}/`);

export const sendSessionRequest = (payload) =>
  api.post('/api/v1/sessions/request/', payload);

export const acceptSession = (sessionId) =>
  api.patch(`/api/v1/sessions/${sessionId}/accept/`);

export const declineSession = (sessionId) =>
  api.patch(`/api/v1/sessions/${sessionId}/decline/`);

export const cancelSession = (sessionId) =>
  api.delete(`/api/v1/sessions/${sessionId}/cancel/`);

export const completeSession = (sessionId) =>
  api.patch(`/api/v1/sessions/${sessionId}/complete/`);

export const submitSessionReview = (sessionId, payload) =>
  api.post(`/api/v1/sessions/${sessionId}/review/`, payload);

export const joinSession = (sessionId) =>
  api.post(`/api/v1/sessions/${sessionId}/join/`);

export const getCreditHistory = () =>
  api.get('/api/v1/sessions/credits/');

export const addMeetingLink = (sessionId, meetingLink) =>
  api.patch(`/api/v1/sessions/${sessionId}/meeting-link/`, { meeting_link: meetingLink });

export const getUserActivity = (userId) =>
  api.get(`/api/v1/sessions/activity/${userId}/`);
