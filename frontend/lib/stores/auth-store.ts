/**
 * Authentication Store (Zustand)
 */

import { create } from 'zustand';
import { apiClient } from '../api-client';

interface User {
  id: string;
  email: string;
  username: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.login({ email, password });
      apiClient.setToken(response.token);
      set({
        user: response.user,
        token: response.token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Login failed',
        isLoading: false,
      });
      throw error;
    }
  },

  register: async (email: string, username: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.register({ email, username, password });
      apiClient.setToken(response.token);
      set({
        user: response.user,
        token: response.token,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Registration failed',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: () => {
    apiClient.clearToken();
    set({
      user: null,
      token: null,
      error: null,
    });
  },

  checkAuth: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      set({ user: null, token: null });
      return;
    }

    try {
      apiClient.setToken(token);
      const response = await apiClient.getMe();
      set({
        user: response.user,
        token,
      });
    } catch (error) {
      apiClient.clearToken();
      set({
        user: null,
        token: null,
      });
    }
  },
}));
