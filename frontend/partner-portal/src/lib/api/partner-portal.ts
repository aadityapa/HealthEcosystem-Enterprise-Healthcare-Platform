import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockPartnerContracts,
  mockPartnerDashboardSummary,
  mockPartnerQuotations,
  mockPartnerRevenue,
  mockPartnerSubscriptions,
  mockPartnerSupportTickets,
  mockPartnerUser,
} from '@/lib/mock-data/partner-portal';
import type {
  PartnerContract,
  PartnerDashboardSummary,
  PartnerQuotation,
  PartnerRevenue,
  PartnerSubscription,
  PartnerSupportTicket,
  PartnerUser,
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

const BASE = '/api/v1/partner-portal';

export const partnerPortalApi = {
  getProfile: () =>
    withMockFallback(() => api.get<PartnerUser>(`${BASE}/profile`), mockPartnerUser),

  getDashboardSummary: () =>
    withMockFallback(
      () => api.get<PartnerDashboardSummary>(`${BASE}/dashboard`),
      mockPartnerDashboardSummary,
    ),

  getSubscriptions: () =>
    withMockFallback(
      () => api.get<PartnerSubscription[]>(`${BASE}/subscriptions`),
      mockPartnerSubscriptions,
    ),

  getQuotations: () =>
    withMockFallback(
      () => api.get<PartnerQuotation[]>(`${BASE}/quotations`),
      mockPartnerQuotations,
    ),

  getContracts: () =>
    withMockFallback(
      () => api.get<PartnerContract[]>(`${BASE}/contracts`),
      mockPartnerContracts,
    ),

  getRevenue: () =>
    withMockFallback(
      () => api.get<PartnerRevenue[]>(`${BASE}/revenue`),
      mockPartnerRevenue,
    ),

  getSupportTickets: () =>
    withMockFallback(
      () => api.get<PartnerSupportTicket[]>(`${BASE}/support`),
      mockPartnerSupportTickets,
    ),

  login: (email: string, password: string) =>
    withMockFallback(
      () =>
        api.post<{ user: PartnerUser; tokens: { accessToken: string } }>(`${BASE}/auth/login`, {
          email,
          password,
        }),
      {
        user: { ...mockPartnerUser, email },
        tokens: { accessToken: 'demo-partner-token' },
      },
      600,
    ),
};
