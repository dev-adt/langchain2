import api from './api';
import { Chatbot, CreateChatbotPayload, Dataset } from '@/types';

export const chatbotService = {
  getChatbots: async (): Promise<Chatbot[]> => {
    const { data } = await api.get('/chatbots');
    return data.chatbots;
  },

  getChatbot: async (id: string): Promise<Chatbot> => {
    const { data } = await api.get(`/chatbots/${id}`);
    return data.chatbot;
  },

  getPublicChatbot: async (id: string): Promise<Chatbot> => {
    const { data } = await api.get(`/chatbots/public/${id}`);
    return data.chatbot;
  },

  createChatbot: async (payload: CreateChatbotPayload): Promise<Chatbot> => {
    const { data } = await api.post('/chatbots', payload);
    return data.chatbot;
  },

  updateChatbot: async (id: string, payload: Partial<CreateChatbotPayload>): Promise<Chatbot> => {
    const { data } = await api.put(`/chatbots/${id}`, payload);
    return data.chatbot;
  },

  uploadAvatar: async (id: string, file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await api.post(`/chatbots/${id}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.avatar;
  },


  deleteChatbot: async (id: string): Promise<void> => {
    await api.delete(`/chatbots/${id}`);
  },

  // File upload
  uploadFile: async (chatbotId: string, file: File): Promise<Dataset> => {
    const formData = new FormData();
    formData.append('file', file);
    const { data } = await api.post(`/chatbots/${chatbotId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.dataset;
  },

  getDatasetStatus: async (datasetId: string): Promise<Dataset> => {
    const { data } = await api.get(`/chatbots/dataset/${datasetId}/status`);
    return data.dataset;
  },

  deleteDataset: async (datasetId: string): Promise<void> => {
    await api.delete(`/chatbots/dataset/${datasetId}`);
  },
};
