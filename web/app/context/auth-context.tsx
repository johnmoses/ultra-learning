'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '@/xlib/api';
import Cookies from 'js-cookie';

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/api/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      // Only clear token if it's actually invalid (401)
      if (error.response?.status === 401) {
        Cookies.remove('token');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    const response = await api.post('/api/auth/login', { username, password });
    const { access_token, user } = response.data;
    
    Cookies.set('token', access_token, { expires: 7 });
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser(user);
  };

  const register = async (name: string, email: string, password: string) => {
    const response = await api.post('/api/auth/register', { username: name, email, password });
    // Registration doesn't return tokens, need to login after
    await login(name, password);
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      Cookies.remove('token');
      delete api.defaults.headers.common['Authorization'];
      setUser(null);
      window.location.href = '/';
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};