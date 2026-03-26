import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { API_CONFIG } from '../config/config';
import { storage } from '../../utils/storageHelper';

const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
});

// Adjunta el access token a cada request
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Cola de requests que esperan el refresh
let isRefreshing = false;
type QueueItem = { resolve: (token: string) => void; reject: (error: unknown) => void };
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null) => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve(token!);
    }
  });
  failedQueue = [];
};

// Si el server devuelve 401, intenta refrescar el access token automáticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Encola el request hasta que termine el refresh
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await storage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token disponible');

        const { data } = await axios.post(
          `${API_CONFIG.BASE_URL}/api/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${refreshToken}` } }
        );

        await storage.setItem('userToken', data.token);
        processQueue(null, data.token);

        originalRequest.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearSession();
        router.replace('/(auth)/login');
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const clearSession = async () => {
  await AsyncStorage.multiRemove(['userId', 'user']);
  await storage.removeItem('userToken');
  await storage.removeItem('refreshToken');
  await storage.removeItem('userEmail');
  await storage.removeItem('userPassword');
};

export default api;
