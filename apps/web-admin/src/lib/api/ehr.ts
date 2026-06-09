import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockAppointments,
  mockConsultations,
  mockEhrDashboardStats,
  mockPrescriptions,
  mockTelemedicineSessions,
} from '@/lib/mock-data/ehr';
import type {
  Appointment,
  Consultation,
  EhrDashboardStats,
  Prescription,
  TelemedicineSession,
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

const BASE = '/api/v1/ehr';

export const ehrApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<EhrDashboardStats>(`${BASE}/stats`),
      mockEhrDashboardStats,
    ),

  listAppointments: () =>
    withMockFallback(() => api.get<Appointment[]>(`${BASE}/appointments`), mockAppointments),

  listConsultations: () =>
    withMockFallback(() => api.get<Consultation[]>(`${BASE}/consultations`), mockConsultations),

  listPrescriptions: () =>
    withMockFallback(() => api.get<Prescription[]>(`${BASE}/prescriptions`), mockPrescriptions),

  listTelemedicineSessions: () =>
    withMockFallback(
      () => api.get<TelemedicineSession[]>(`${BASE}/telemedicine`),
      mockTelemedicineSessions,
    ),
};
