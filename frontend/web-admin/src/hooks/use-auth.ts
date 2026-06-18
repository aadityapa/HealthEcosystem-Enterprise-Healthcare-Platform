'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';

export function useAuth() {
  const router = useRouter();
  const { user, tokens, isAuthenticated, isLoading, error, login, loginDemo, logout, clearError } =
    useAuthStore();

  const signIn = useCallback(
    async (email: string, password: string) => {
      await login({ email, password });
      router.push('/');
    },
    [login, router],
  );

  const signOut = useCallback(() => {
    logout();
    router.push('/login');
  }, [logout, router]);

  const signInDemo = useCallback(() => {
    loginDemo();
    router.push('/');
  }, [loginDemo, router]);

  return {
    user,
    tokens,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signInDemo,
    signOut,
    clearError,
  };
}
