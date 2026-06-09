import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthTokens, PartnerUser } from '@/types';
import { mockPartnerUser } from '@/lib/mock-data/partner-portal';
import { partnerPortalApi } from '@/lib/api/partner-portal';

interface AuthState {
  user: PartnerUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginDemo: () => void;
  logout: () => void;
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

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await partnerPortalApi.login(email, password);
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
              : 'Login failed. Please try again.';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      loginDemo: () => {
        set({
          user: mockPartnerUser,
          tokens: { accessToken: 'demo-partner-token' },
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

      clearError: () => set({ error: null }),
    }),
    {
      name: 'health-partner-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
