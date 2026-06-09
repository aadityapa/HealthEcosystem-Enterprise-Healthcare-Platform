import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockBrandingDashboardStats,
  mockBrandingThemes,
  mockFeatureFlags,
  mockFranchiseBranding,
} from '@/lib/mock-data/branding';
import type {
  BrandingDashboardStats,
  BrandingTheme,
  FeatureFlag,
  FranchiseBranding,
} from '@/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

async function withMockFallback<T>(apiCall: () => Promise<T>, mockData: T, delay = 600): Promise<T> {
  if (USE_MOCK) return fetchWithDelay(mockData, delay);
  try {
    return await apiCall();
  } catch {
    return fetchWithDelay(mockData, delay);
  }
}

const BASE = '/api/v1/branding';

export const brandingApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<BrandingDashboardStats>(`${BASE}/stats`),
      mockBrandingDashboardStats,
    ),

  listThemes: () =>
    withMockFallback(
      () => api.get<BrandingTheme[]>(`${BASE}/themes`),
      mockBrandingThemes,
    ),

  listFeatureFlags: () =>
    withMockFallback(
      () => api.get<FeatureFlag[]>(`${BASE}/features`),
      mockFeatureFlags,
    ),

  listFranchiseBranding: () =>
    withMockFallback(
      () => api.get<FranchiseBranding[]>(`${BASE}/franchise`),
      mockFranchiseBranding,
    ),
};
