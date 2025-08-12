import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
// Set the API base URL
const API_BASE_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5001/api'
  : 'http://localhost:5001/api';
// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Centralized error logging
const logError = (error: any) => {
  console.error('API Error:', error.response?.status, error.message);
};
// Request interceptor to add auth token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers!.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', {
    method: config.method,
    url: config.url,
    data: config.data,
    headers: config.headers,
  });
  return config;
});
// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Handle token refresh on 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Prevent infinite loop
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      if (refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, {
            headers: { Authorization: `Bearer ${refreshToken}` },
          });
          // Store new access token
          await AsyncStorage.setItem('access_token', response.data.access_token);

          // Update the Authorization header and retry the original request
          originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          console.error('Token refresh failed:', refreshError);
          await AsyncStorage.removeItem('access_token');
          await AsyncStorage.removeItem('refresh_token');
          // Redirect to login or handle logout
          // You might want to use a navigation library to redirect
        }
      }
    }
    // Handle other errors
    if (error.response) {
      console.error('API Error:', error.response.status, error.response.data);
      // Optionally handle specific status codes here (e.g., 403, 404)
    } else {
      console.error('Network Error:', error.message);
    }
    return Promise.reject(error);
  }
);
// Auth API functions
export const authAPI = {
  login: async (username: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { username, password });
      await AsyncStorage.setItem('access_token', response.data.access_token);
      await AsyncStorage.setItem('refresh_token', response.data.refresh_token);
      return response.data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  // register: async (username: string, email: string, password: string, role = 'user') => {
  //   try {
  //     const response = await api.post('/auth/register', { username, email, password, role });
  //     return response.data;
  //   } catch (error) {
  //     console.error('Registration failed:', error);
  //     throw error;
  //   }
  // },
  register: async (username: string, email: string, password: string, role = 'user') => {
    const isValidEmail = (email: string) => {
      const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return regex.test(email);
    };
    email = email.trim(); // Trim any whitespace
    if (!isValidEmail(email)) {
      throw new Error('Invalid email address');
    }
    try {
      console.log('Registering user with:', { username, email, password, role });
      const response = await api.post('/auth/register', { username, email, password, role });
      return response.data;
    } catch (error: any) {
      if (error.response) { // Check if the error is an AxiosError with a response
        console.error('Registration failed:', error.response.data); // Log the error response data
        throw new Error(error.response.data.message || 'Registration failed'); // Throw an error with the message from the response or a generic message
      } else {
        console.error('Registration failed:', (error as Error).message);
        throw new Error((error as Error).message);
      }
    }
  },
  profile: async () => {
    try {
      const response = await api.get('/auth/profile');
      return response.data;
    } catch (error) {
      console.error('Fetching profile failed:', error);
      throw error;
    }
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
      await AsyncStorage.removeItem('access_token');
      await AsyncStorage.removeItem('refresh_token');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },
};
// Chat API functions
export const chatAPI = {
  getRooms: async () => {
    try {
      const response = await api.get('/chat/rooms');
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  createRoom: async (name: string, description?: string) => {
    try {
      const response = await api.post('/chat/rooms', { name, description });
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  joinRoom: async (roomId: number) => {
    try {
      const response = await api.post(`/chat/rooms/${roomId}/participants`);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  getMessages: async (roomId: number) => {
    try {
      const response = await api.get(`/chat/rooms/${roomId}/messages`);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  sendMessage: async (roomId: number, content: string, role: string) => {
    try {
      const response = await api.post(`/chat/rooms/${roomId}/post_message`, { content, role });
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
};
// Learning API functions
export const learningAPI = {
  getPacks: async () => {
    try {
      // The axios interceptor automatically adds the Authorization header.
      // No need to manually handle tokens or headers here.
      const response = await api.get('/learning/packs');
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  getPackById: async (packId: number) => {
    try {
      const response = await api.get(`/learning/packs/${packId}`);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  createPack: async (title: string, description?: string) => {
    try {
      const response = await api.post('/learning/packs', { title, description });
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  getFlashcards: async (packId?: number) => {
    try {
      const url = packId ? `/learning/flashcards?pack_id=${packId}` : '/learning/flashcards';
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  createFlashcard: async (question: string, answer: string, packId: number) => {
    try {
      const response = await api.post('/learning/flashcards', { question, answer, pack_id: packId });
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  generateFlashcards: async (method: string, packId: number, data: any) => {
    try {
      const response = await api.post('/learning/generate', { method, pack_id: packId, ...data });
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  logSession: async (sessionData: any) => {
    try {
      const response = await api.post('/learning/sessions', sessionData);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  updateFlashcard: async (flashcardId: number, question: string, answer: string) => {
    try {
      const response = await api.put(`/learning/flashcards/${flashcardId}`, { question, answer });
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  deleteFlashcard: async (flashcardId: number) => {
    try {
      const response = await api.delete(`/learning/flashcards/${flashcardId}`);
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
};
// Dashboard API functions
export const dashboardAPI = {
  getStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
  getOverview: async () => {
    try {
      const response = await api.get('/dashboard/overview');
      return response.data;
    } catch (error) {
      logError(error);
      throw error;
    }
  },
};
export default api;