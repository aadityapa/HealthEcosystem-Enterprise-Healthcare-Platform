import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthTokens, PatientUser } from '@/types';
import { MOCK_OTP, mockPatientUser } from '@/lib/mock-data/patient-portal';
import { patientPortalApi } from '@/lib/api/patient-portal';

interface AuthState {
  user: PatientUser | null;
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
          await patientPortalApi.requestOtp(phone);
          set({ otpSent: true, pendingPhone: phone, isLoading: false });
        } catch (err) {
          const message =
            err && typeof err === 'object' && 'message' in err
              ? String((err as { message: string }).message)
              : 'Failed to send OTP. Please try again.';
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
          const response = await patientPortalApi.verifyOtp(phone, otp);
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
              : 'OTP verification failed. Please try again.';
          set({ error: message, isLoading: false });
          throw err;
        }
      },

      loginDemo: () => {
        set({
          user: mockPatientUser,
          tokens: { accessToken: 'demo-patient-token' },
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
      name: 'health-patient-auth',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
