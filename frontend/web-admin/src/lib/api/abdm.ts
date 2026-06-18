import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockAbdmDashboardStats,
  mockAbhaRecords,
  mockConsentRecords,
  mockFhirBundles,
  mockHealthExchangeRecords,
} from '@/lib/mock-data/abdm';
import type {
  AbdmDashboardStats,
  AbhaRecord,
  ConsentRecord,
  FhirBundle,
  HealthExchangeRecord,
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

const BASE = '/api/v1/abdm';

export const abdmApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<AbdmDashboardStats>(`${BASE}/stats`),
      mockAbdmDashboardStats,
    ),

  listAbhaRecords: () =>
    withMockFallback(() => api.get<AbhaRecord[]>(`${BASE}/abha`), mockAbhaRecords),

  listConsentRecords: () =>
    withMockFallback(() => api.get<ConsentRecord[]>(`${BASE}/consent`), mockConsentRecords),

  listFhirBundles: () =>
    withMockFallback(() => api.get<FhirBundle[]>(`${BASE}/fhir`), mockFhirBundles),

  listExchangeRecords: () =>
    withMockFallback(
      () => api.get<HealthExchangeRecord[]>(`${BASE}/exchange`),
      mockHealthExchangeRecords,
    ),
};
