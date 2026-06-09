'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const router = useRouter();
  const {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    otpSent,
    pendingPhone,
    requestOtp,
    verifyOtp,
    loginDemo,
    logout,
    clearError,
    resetOtpFlow,
  } = useAuthStore();

  const sendOtp = useCallback(
    async (phone: string) => {
      await requestOtp(phone);
    },
    [requestOtp],
  );

  const confirmOtp = useCallback(
    async (phone: string, otp: string) => {
      await verifyOtp(phone, otp);
      router.push('/');
    },
    [verifyOtp, router],
  );

  const signInDemo = useCallback(() => {
    loginDemo();
    router.push('/');
  }, [loginDemo, router]);

  const signOut = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    otpSent,
    pendingPhone,
    sendOtp,
    confirmOtp,
    signInDemo,
    signOut,
    clearError,
    resetOtpFlow,
  };
}
