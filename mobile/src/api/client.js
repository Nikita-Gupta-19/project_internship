import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — attach JWT token if present
client.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Storage read failure — proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — clear token on 401
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('token');
      } catch {
        // Ignore storage errors
      }
    }
    return Promise.reject(error);
  }
);

export default client;
