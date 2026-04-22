import api from './api';
import { AuthResponse } from '@/types';

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/login', { email, password });
    return data;
  },

  register: async (email: string, password: string, name: string): Promise<AuthResponse> => {
    const { data } = await api.post('/auth/register', { email, password, name });
    return data;
  },

  getProfile: async () => {
    const { data } = await api.get('/auth/profile');
    return data.user;
  },
};
