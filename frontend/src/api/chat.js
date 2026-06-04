import axiosInstance from './axios';

export const getChats = () => {
  return axiosInstance.get('/api/v1/chat/');
};

export const getConversation = (receiverId) => {
  return axiosInstance.get(`/api/v1/chat/conversation/${receiverId}/`);
};

export const sendMessage = (data) => {
  return axiosInstance.post('/api/v1/chat/send/', data);
};
