import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockDmsDashboardStats,
  mockDmsDocuments,
  mockDmsRetentionPolicies,
  mockDmsSearchResults,
} from '@/lib/mock-data/dms';
import type {
  DmsDashboardStats,
  DmsDocument,
  DmsRetentionPolicy,
  DmsSearchResult,
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

const BASE = '/api/v1/dms';

export const dmsApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<DmsDashboardStats>(`${BASE}/stats`),
      mockDmsDashboardStats,
    ),

  listDocuments: () =>
    withMockFallback(
      () => api.get<DmsDocument[]>(`${BASE}/documents`),
      mockDmsDocuments,
    ),

  listSearchResults: () =>
    withMockFallback(
      () => api.get<DmsSearchResult[]>(`${BASE}/search`),
      mockDmsSearchResults,
    ),

  listRetentionPolicies: () =>
    withMockFallback(
      () => api.get<DmsRetentionPolicy[]>(`${BASE}/retention`),
      mockDmsRetentionPolicies,
    ),
};
