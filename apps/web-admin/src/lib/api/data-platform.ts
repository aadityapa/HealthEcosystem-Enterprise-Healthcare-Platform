import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockDataExports,
  mockDataLakeDatasets,
  mockDataPipelines,
  mockDataPlatformDashboardStats,
  mockWarehouseTables,
} from '@/lib/mock-data/data-platform';
import type {
  DataExport,
  DataLakeDataset,
  DataPipeline,
  DataPlatformDashboardStats,
  WarehouseTable,
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

const BASE = '/api/v1/data-platform';

export const dataPlatformApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<DataPlatformDashboardStats>(`${BASE}/stats`),
      mockDataPlatformDashboardStats,
    ),

  listPipelines: () =>
    withMockFallback(
      () => api.get<DataPipeline[]>(`${BASE}/pipelines`),
      mockDataPipelines,
    ),

  listLakeDatasets: () =>
    withMockFallback(
      () => api.get<DataLakeDataset[]>(`${BASE}/lake`),
      mockDataLakeDatasets,
    ),

  listWarehouseTables: () =>
    withMockFallback(
      () => api.get<WarehouseTable[]>(`${BASE}/warehouse`),
      mockWarehouseTables,
    ),

  listExports: () =>
    withMockFallback(
      () => api.get<DataExport[]>(`${BASE}/exports`),
      mockDataExports,
    ),
};
