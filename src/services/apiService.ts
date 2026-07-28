import axios from 'axios';
import { ENV } from '../config/env';

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('fg_secure_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  async getKpis() {
    try {
      const response = await apiClient.get('/pumptracker/kpis');
      return response.data;
    } catch {
      return null;
    }
  },

  async getCompanies() {
    try {
      const response = await apiClient.get('/pumptracker/companies');
      return response.data;
    } catch {
      return null;
    }
  },
};
