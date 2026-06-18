import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  getReportById,
  mockAppointments,
  mockBranches,
  mockDashboardSummary,
  mockInvoices,
  mockLabReports,
  mockPatientUser,
  mockTestCatalog,
  mockTimelineEvents,
  mockTimeSlots,
} from '@/lib/mock-data/patient-portal';
import type {
  Appointment,
  BookingRequest,
  BranchOption,
  DashboardSummary,
  HomeCollectionRequest,
  LabReport,
  PatientInvoice,
  PatientUser,
  TestCatalogItem,
  TimelineEvent,
  TimeSlot,
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

const BASE = '/api/v1/patient-portal';

export const patientPortalApi = {
  getProfile: () =>
    withMockFallback(() => api.get<PatientUser>(`${BASE}/profile`), mockPatientUser),

  getDashboardSummary: () =>
    withMockFallback(
      () => api.get<DashboardSummary>(`${BASE}/dashboard`),
      mockDashboardSummary,
    ),

  getTimeline: () =>
    withMockFallback(() => api.get<TimelineEvent[]>(`${BASE}/timeline`), mockTimelineEvents),

  getAppointments: () =>
    withMockFallback(
      () => api.get<Appointment[]>(`${BASE}/appointments`),
      mockAppointments,
    ),

  getReports: () =>
    withMockFallback(() => api.get<LabReport[]>(`${BASE}/reports`), mockLabReports),

  getReport: (id: string) =>
    withMockFallback(
      () => api.get<LabReport>(`${BASE}/reports/${id}`),
      getReportById(id) ?? mockLabReports[0],
    ),

  getTestCatalog: () =>
    withMockFallback(() => api.get<TestCatalogItem[]>(`${BASE}/tests`), mockTestCatalog),

  getBranches: () =>
    withMockFallback(() => api.get<BranchOption[]>(`${BASE}/branches`), mockBranches),

  getTimeSlots: (date: string) =>
    withMockFallback(
      () => api.get<TimeSlot[]>(`${BASE}/time-slots`, { params: { date } }),
      mockTimeSlots,
    ),

  getInvoices: () =>
    withMockFallback(() => api.get<PatientInvoice[]>(`${BASE}/invoices`), mockInvoices),

  createBooking: (request: BookingRequest) =>
    withMockFallback(
      () => api.post<{ id: string; message: string }>(`${BASE}/bookings`, request),
      { id: `bk-${Date.now()}`, message: 'Booking confirmed successfully' },
      800,
    ),

  scheduleHomeCollection: (request: HomeCollectionRequest) =>
    withMockFallback(
      () => api.post<{ id: string; message: string }>(`${BASE}/home-collection`, request),
      { id: `hc-${Date.now()}`, message: 'Home collection scheduled successfully' },
      800,
    ),

  requestOtp: (phone: string) =>
    withMockFallback(
      () => api.post<{ success: boolean; message: string }>(`${BASE}/auth/otp`, { phone }),
      { success: true, message: 'OTP sent successfully' },
      500,
    ),

  verifyOtp: (phone: string, otp: string) =>
    withMockFallback(
      () =>
        api.post<{ user: PatientUser; tokens: { accessToken: string } }>(
          `${BASE}/auth/verify`,
          { phone, otp },
        ),
      {
        user: { ...mockPatientUser, phone },
        tokens: { accessToken: 'demo-patient-token' },
      },
      600,
    ),
};
