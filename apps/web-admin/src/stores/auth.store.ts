import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthTokens, LoginCredentials, User } from '@/types';
import { api } from '@/lib/api/client';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginDemo: () => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post<{ user: User; tokens: AuthTokens }>(
            '/api/v1/auth/login',
            credentials,
          );
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          const message =
            err && typeof err === 'object' && 'message' in err
              ? String((err as { message: string }).message)
              : 'Login failed. Please check your credentials.';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      loginDemo: () => {
        set({
          user: {
            id: 'demo-admin',
            email: 'admin@healthecosystem.in',
            name: 'Dr. Admin User',
            role: 'Branch Administrator',
            branchId: 'b1',
            branchName: 'Mumbai Central Lab',
          },
          tokens: { accessToken: 'demo-token' },
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      },

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
        });
      },

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'health-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
