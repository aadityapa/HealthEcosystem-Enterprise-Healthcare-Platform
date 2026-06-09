import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockCalibrationRecords,
  mockCapaRecords,
  mockQcChartData,
  mockQcDashboardStats,
  mockQcMaterials,
  mockQcRuns,
} from '@/lib/mock-data/qc';
import type {
  CalibrationRecord,
  CapaRecord,
  QcChartData,
  QcDashboardStats,
  QcMaterial,
  QcRun,
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

const BASE = '/api/v1/qc';

export const qcApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<QcDashboardStats>(`${BASE}/stats`),
      mockQcDashboardStats,
    ),

  listMaterials: () =>
    withMockFallback(() => api.get<QcMaterial[]>(`${BASE}/materials`), mockQcMaterials),

  listRuns: () =>
    withMockFallback(() => api.get<QcRun[]>(`${BASE}/runs`), mockQcRuns),

  getChartData: (materialId?: string) =>
    withMockFallback(
      () => api.get<QcChartData>(`${BASE}/charts`, { params: { materialId } }),
      mockQcChartData,
    ),

  listCalibrations: () =>
    withMockFallback(
      () => api.get<CalibrationRecord[]>(`${BASE}/calibration`),
      mockCalibrationRecords,
    ),

  listCapa: () =>
    withMockFallback(() => api.get<CapaRecord[]>(`${BASE}/capa`), mockCapaRecords),
};
