import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 for non-auth endpoints and if we're not already on login page
    if (error.response?.status === 401 && 
        !error.config?.url?.includes('/auth/') && 
        !window.location.pathname.includes('/auth/')) {
      // Clear any stored token
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);