import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockPacsNodes,
  mockRadiologyDashboardStats,
  mockRadiologyReports,
  mockRadiologyStudies,
  mockRadiologyWorklist,
} from '@/lib/mock-data/radiology';
import type {
  PacsNode,
  RadiologyDashboardStats,
  RadiologyReport,
  RadiologyStudy,
  RadiologyWorklistItem,
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

const BASE = '/api/v1/radiology';

export const radiologyApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<RadiologyDashboardStats>(`${BASE}/stats`),
      mockRadiologyDashboardStats,
    ),

  listStudies: () =>
    withMockFallback(
      () => api.get<RadiologyStudy[]>(`${BASE}/studies`),
      mockRadiologyStudies,
    ),

  listWorklist: () =>
    withMockFallback(
      () => api.get<RadiologyWorklistItem[]>(`${BASE}/worklist`),
      mockRadiologyWorklist,
    ),

  listPacsNodes: () =>
    withMockFallback(
      () => api.get<PacsNode[]>(`${BASE}/pacs`),
      mockPacsNodes,
    ),

  listReports: () =>
    withMockFallback(
      () => api.get<RadiologyReport[]>(`${BASE}/reports`),
      mockRadiologyReports,
    ),
};
