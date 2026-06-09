import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockCapacityMetrics,
  mockObservabilityDashboardStats,
  mockServiceMapNodes,
  mockSlaMetrics,
  mockTraceRecords,
} from '@/lib/mock-data/observability';
import type {
  CapacityMetric,
  ObservabilityDashboardStats,
  ServiceMapNode,
  SlaMetric,
  TraceRecord,
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

const BASE = '/api/v1/observability';

export const observabilityApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<ObservabilityDashboardStats>(`${BASE}/stats`),
      mockObservabilityDashboardStats,
    ),

  listTraces: () =>
    withMockFallback(
      () => api.get<TraceRecord[]>(`${BASE}/traces`),
      mockTraceRecords,
    ),

  listSlaMetrics: () =>
    withMockFallback(
      () => api.get<SlaMetric[]>(`${BASE}/sla`),
      mockSlaMetrics,
    ),

  listServiceMap: () =>
    withMockFallback(
      () => api.get<ServiceMapNode[]>(`${BASE}/service-map`),
      mockServiceMapNodes,
    ),

  listCapacityMetrics: () =>
    withMockFallback(
      () => api.get<CapacityMetric[]>(`${BASE}/capacity`),
      mockCapacityMetrics,
    ),
};
