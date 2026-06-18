import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  getRouteById,
  getStopById,
  mockAttendance,
  mockGpsHistory,
  mockPhlebotomist,
  mockTodayRoute,
  mockTodaySummary,
} from '@/lib/mock-data/field';
import type {
  AttendanceRecord,
  CollectionProof,
  FieldRoute,
  GpsPing,
  PhlebotomistUser,
  RouteStop,
  TodayRouteSummary,
} from '@/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';
const BASE = '/api/v1/field';

async function withMockFallback<T>(apiCall: () => Promise<T>, mockData: T, delay = 600): Promise<T> {
  if (USE_MOCK) return fetchWithDelay(mockData, delay);
  try {
    return await apiCall();
  } catch {
    return fetchWithDelay(mockData, delay);
  }
}

export const fieldApi = {
  getProfile: () =>
    withMockFallback(
      () => api.get<PhlebotomistUser>(`${BASE}/phlebotomists/${mockPhlebotomist.id}`),
      mockPhlebotomist,
    ),

  getTodayRoute: () =>
    withMockFallback(async () => {
      const res = await api.get<{ items: FieldRoute[] }>(`${BASE}/routes`, {
        params: { routeDate: new Date().toISOString().slice(0, 10), limit: 1 },
      });
      const route = res.items[0] ?? null;
      const pendingStops = route?.stops.filter((s) => s.status !== 'COLLECTED').length ?? 0;
      const nextStop = route?.stops.find((s) => ['PENDING', 'EN_ROUTE', 'ARRIVED'].includes(s.status)) ?? null;
      return { route, pendingStops, nextStop } satisfies TodayRouteSummary;
    }, mockTodaySummary),

  getRoute: (id: string) =>
    withMockFallback(
      () => api.get<FieldRoute>(`${BASE}/routes/${id}`),
      getRouteById(id) ?? mockTodayRoute,
    ),

  getStop: (id: string) =>
    withMockFallback(
      () => api.get<RouteStop & { route: FieldRoute }>(`${BASE}/stops/${id}`),
      { ...(getStopById(id) ?? mockTodayRoute.stops[1]), route: mockTodayRoute },
    ),

  startRoute: (id: string) =>
    withMockFallback(
      () => api.post<FieldRoute>(`${BASE}/routes/${id}/start`),
      { ...mockTodayRoute, status: 'IN_PROGRESS', startedAt: new Date().toISOString() },
      400,
    ),

  updateStopStatus: (id: string, status: string) =>
    withMockFallback(
      () => api.patch<RouteStop>(`${BASE}/stops/${id}/status`, { status }),
      { ...(getStopById(id) ?? mockTodayRoute.stops[1]), status: status as RouteStop['status'] },
      400,
    ),

  submitProof: (id: string, proof: CollectionProof) =>
    withMockFallback(
      () => api.post(`${BASE}/stops/${id}/proof`, proof),
      { stopId: id, proof: { ...proof, collectedAt: new Date().toISOString() } },
      800,
    ),

  checkIn: (lat: number, lng: number) =>
    withMockFallback(
      () =>
        api.post<AttendanceRecord>(`${BASE}/attendance/check-in`, {
          phlebotomistId: mockPhlebotomist.id,
          lat,
          lng,
        }),
      { ...mockAttendance, checkInAt: new Date().toISOString() },
      500,
    ),

  checkOut: () =>
    withMockFallback(
      () =>
        api.post<AttendanceRecord>(`${BASE}/attendance/check-out`, {
          phlebotomistId: mockPhlebotomist.id,
        }),
      { ...mockAttendance, checkOutAt: new Date().toISOString() },
      500,
    ),

  getAttendance: () =>
    withMockFallback(
      () =>
        api.get<{ items: AttendanceRecord[] }>(`${BASE}/attendance`, {
          params: { phlebotomistId: mockPhlebotomist.id, limit: 10 },
        }),
      { items: [mockAttendance] },
    ),

  recordPing: (lat: number, lng: number) =>
    withMockFallback(
      () =>
        api.post<GpsPing>(`${BASE}/tracking/ping`, {
          phlebotomistId: mockPhlebotomist.id,
          lat,
          lng,
        }),
      { id: `ping-${Date.now()}`, lat, lng, recordedAt: new Date().toISOString() },
      300,
    ),

  getTrackingHistory: () =>
    withMockFallback(
      () =>
        api.get<{ items: GpsPing[] }>(`${BASE}/tracking/history`, {
          params: { phlebotomistId: mockPhlebotomist.id, limit: 20 },
        }),
      { items: mockGpsHistory },
    ),

  requestOtp: (phone: string) =>
    withMockFallback(
      () => api.post<{ success: boolean }>(`${BASE}/auth/otp`, { phone }),
      { success: true },
      500,
    ),

  verifyOtp: (phone: string, _otp: string) =>
    withMockFallback(
      () =>
        api.post<{ user: PhlebotomistUser; tokens: { accessToken: string } }>(
          `${BASE}/auth/verify`,
          { phone, otp: _otp },
        ),
      {
        user: { ...mockPhlebotomist, phone },
        tokens: { accessToken: 'demo-phlebotomist-token' },
      },
      600,
    ),
};
