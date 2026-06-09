import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockBillingCodes,
  mockDepartments,
  mockGeography,
  mockPackages,
  mockProfiles,
  mockRateCards,
  mockSpecialties,
  mockTaxMasters,
  mockTests,
  getTestById,
} from '@/lib/mock-data/master-data';
import type {
  BillingCode,
  Department,
  PackageMaster,
  ProfileMaster,
  RateCard,
  Specialty,
  StateMaster,
  TaxMaster,
  TestMaster,
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

const BASE = '/api/v1/master';

export const masterDataApi = {
  listTests: () =>
    withMockFallback(() => api.get<TestMaster[]>(`${BASE}/tests`), mockTests),

  getTest: (id: string) =>
    withMockFallback(
      () => api.get<TestMaster>(`${BASE}/tests/${id}`),
      getTestById(id) ?? mockTests[0],
    ),

  listPackages: () =>
    withMockFallback(() => api.get<PackageMaster[]>(`${BASE}/packages`), mockPackages),

  listProfiles: () =>
    withMockFallback(() => api.get<ProfileMaster[]>(`${BASE}/profiles`), mockProfiles),

  listRateCards: () =>
    withMockFallback(() => api.get<RateCard[]>(`${BASE}/rate-cards`), mockRateCards),

  listTaxMasters: () =>
    withMockFallback(() => api.get<TaxMaster[]>(`${BASE}/tax`), mockTaxMasters),

  listBillingCodes: () =>
    withMockFallback(() => api.get<BillingCode[]>(`${BASE}/billing-codes`), mockBillingCodes),

  listSpecialties: () =>
    withMockFallback(() => api.get<Specialty[]>(`${BASE}/specialties`), mockSpecialties),

  listDepartments: () =>
    withMockFallback(() => api.get<Department[]>(`${BASE}/departments`), mockDepartments),

  listGeography: () =>
    withMockFallback(() => api.get<StateMaster[]>(`${BASE}/geography`), mockGeography),
};
