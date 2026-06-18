import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockCrmDashboardStats,
  mockDoctors,
  mockHealthCamps,
  mockReferrals,
  mockSalesLeads,
  mockSalesRecords,
} from '@/lib/mock-data/crm';
import type {
  CrmDashboardStats,
  Doctor,
  HealthCamp,
  Referral,
  SalesLead,
  SalesRecord,
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

const BASE = '/api/v1/crm';

export const crmApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<CrmDashboardStats>(`${BASE}/stats`),
      mockCrmDashboardStats,
    ),

  listDoctors: () =>
    withMockFallback(() => api.get<Doctor[]>(`${BASE}/doctors`), mockDoctors),

  listReferrals: () =>
    withMockFallback(() => api.get<Referral[]>(`${BASE}/referrals`), mockReferrals),

  listCamps: () =>
    withMockFallback(() => api.get<HealthCamp[]>(`${BASE}/camps`), mockHealthCamps),

  listLeads: () =>
    withMockFallback(() => api.get<SalesLead[]>(`${BASE}/leads`), mockSalesLeads),

  listSales: () =>
    withMockFallback(() => api.get<SalesRecord[]>(`${BASE}/sales`), mockSalesRecords),
};
