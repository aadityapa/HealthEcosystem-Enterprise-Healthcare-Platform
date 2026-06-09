import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockAnalyticsDashboardStats,
  mockBranchAnalytics,
  mockDeviceAnalytics,
  mockExecutiveMetrics,
  mockPredictiveInsights,
  mockQcAnalytics,
  mockReferralAnalytics,
  mockRevenueAnalytics,
  mockTestAnalytics,
} from '@/lib/mock-data/analytics';
import type {
  AnalyticsDashboardStats,
  BranchAnalyticsRow,
  DeviceAnalyticsRow,
  ExecutiveMetric,
  PredictiveInsight,
  QcAnalyticsRow,
  ReferralAnalyticsRow,
  RevenueAnalyticsRow,
  TestAnalyticsRow,
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

const BASE = '/api/v1/analytics';

export const analyticsApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<AnalyticsDashboardStats>(`${BASE}/stats`),
      mockAnalyticsDashboardStats,
    ),

  listExecutiveMetrics: () =>
    withMockFallback(
      () => api.get<ExecutiveMetric[]>(`${BASE}/executive`),
      mockExecutiveMetrics,
    ),

  listRevenueAnalytics: () =>
    withMockFallback(
      () => api.get<RevenueAnalyticsRow[]>(`${BASE}/revenue`),
      mockRevenueAnalytics,
    ),

  listBranchAnalytics: () =>
    withMockFallback(
      () => api.get<BranchAnalyticsRow[]>(`${BASE}/branches`),
      mockBranchAnalytics,
    ),

  listTestAnalytics: () =>
    withMockFallback(
      () => api.get<TestAnalyticsRow[]>(`${BASE}/tests`),
      mockTestAnalytics,
    ),

  listReferralAnalytics: () =>
    withMockFallback(
      () => api.get<ReferralAnalyticsRow[]>(`${BASE}/referrals`),
      mockReferralAnalytics,
    ),

  listQcAnalytics: () =>
    withMockFallback(
      () => api.get<QcAnalyticsRow[]>(`${BASE}/qc`),
      mockQcAnalytics,
    ),

  listDeviceAnalytics: () =>
    withMockFallback(
      () => api.get<DeviceAnalyticsRow[]>(`${BASE}/devices`),
      mockDeviceAnalytics,
    ),

  listPredictiveInsights: () =>
    withMockFallback(
      () => api.get<PredictiveInsight[]>(`${BASE}/predictive`),
      mockPredictiveInsights,
    ),
};
