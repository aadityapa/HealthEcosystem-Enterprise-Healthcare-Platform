import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockCollectionRoutes,
  mockFieldAttendance,
  mockFieldDashboardStats,
  mockFieldTracking,
  mockGeofences,
  mockPhlebotomists,
} from '@/lib/mock-data/field';
import type {
  CollectionRoute,
  FieldAttendanceRecord,
  FieldDashboardStats,
  FieldTrackingRecord,
  Geofence,
  Phlebotomist,
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

const BASE = '/api/v1/field';

export const fieldApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<FieldDashboardStats>(`${BASE}/stats`),
      mockFieldDashboardStats,
    ),

  listPhlebotomists: () =>
    withMockFallback(
      () => api.get<Phlebotomist[]>(`${BASE}/phlebotomists`),
      mockPhlebotomists,
    ),

  listRoutes: () =>
    withMockFallback(
      () => api.get<CollectionRoute[]>(`${BASE}/routes`),
      mockCollectionRoutes,
    ),

  listTracking: () =>
    withMockFallback(
      () => api.get<FieldTrackingRecord[]>(`${BASE}/tracking`),
      mockFieldTracking,
    ),

  listAttendance: () =>
    withMockFallback(
      () => api.get<FieldAttendanceRecord[]>(`${BASE}/attendance`),
      mockFieldAttendance,
    ),

  listGeofences: () =>
    withMockFallback(
      () => api.get<Geofence[]>(`${BASE}/geofences`),
      mockGeofences,
    ),
};
