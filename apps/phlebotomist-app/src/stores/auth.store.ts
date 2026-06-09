import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthTokens, PhlebotomistUser } from '@/types';
import { MOCK_OTP, mockPhlebotomist } from '@/lib/mock-data/field';
import { fieldApi } from '@/lib/api/field';

interface AuthState {
  user: PhlebotomistUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  otpSent: boolean;
  pendingPhone: string | null;
  requestOtp: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  loginDemo: () => void;
  logout: () => void;
  clearError: () => void;
  resetOtpFlow: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      otpSent: false,
      pendingPhone: null,

      requestOtp: async (phone) => {
        set({ isLoading: true, error: null });
        try {
          await fieldApi.requestOtp(phone);
          set({ otpSent: true, pendingPhone: phone, isLoading: false });
        } catch (err) {
          const message =
            err && typeof err === 'object' && 'message' in err
              ? String((err as { message: string }).message)
              : 'Failed to send OTP.';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      verifyOtp: async (phone, otp) => {
        set({ isLoading: true, error: null });
        try {
          if (otp !== MOCK_OTP) {
            throw new Error('Invalid OTP. Use 123456 for demo.');
          }
          const response = await fieldApi.verifyOtp(phone, otp);
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            otpSent: false,
            pendingPhone: null,
          });
        } catch (err) {
          const message =
            err && typeof err === 'object' && 'message' in err
              ? String((err as { message: string }).message)
              : 'OTP verification failed.';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      loginDemo: () => {
        set({
          user: mockPhlebotomist,
          tokens: { accessToken: 'demo-phlebotomist-token' },
          isAuthenticated: true,
          isLoading: false,
          error: null,
          otpSent: false,
          pendingPhone: null,
        });
      },

      logout: () => {
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
          error: null,
          otpSent: false,
          pendingPhone: null,
        });
      },

      clearError: () => set({ error: null }),
      resetOtpFlow: () => set({ otpSent: false, pendingPhone: null, error: null }),
    }),
    {
      name: 'health-phlebotomist-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
