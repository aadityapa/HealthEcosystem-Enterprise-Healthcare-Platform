import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockEmployees,
  mockHrmsAttendance,
  mockHrmsDashboardStats,
  mockPayrollRecords,
  mockShifts,
  mockTrainingRecords,
} from '@/lib/mock-data/hrms';
import type {
  Employee,
  HrmsAttendanceRecord,
  HrmsDashboardStats,
  PayrollRecord,
  Shift,
  TrainingRecord,
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

const BASE = '/api/v1/hrms';

export const hrmsApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<HrmsDashboardStats>(`${BASE}/stats`),
      mockHrmsDashboardStats,
    ),

  listEmployees: () =>
    withMockFallback(
      () => api.get<Employee[]>(`${BASE}/employees`),
      mockEmployees,
    ),

  listPayroll: () =>
    withMockFallback(
      () => api.get<PayrollRecord[]>(`${BASE}/payroll`),
      mockPayrollRecords,
    ),

  listAttendance: () =>
    withMockFallback(
      () => api.get<HrmsAttendanceRecord[]>(`${BASE}/attendance`),
      mockHrmsAttendance,
    ),

  listShifts: () =>
    withMockFallback(
      () => api.get<Shift[]>(`${BASE}/shifts`),
      mockShifts,
    ),

  listTraining: () =>
    withMockFallback(
      () => api.get<TrainingRecord[]>(`${BASE}/training`),
      mockTrainingRecords,
    ),
};
