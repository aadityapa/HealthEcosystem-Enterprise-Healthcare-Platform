import { api } from '@/lib/api/client';

import { fetchWithDelay } from '@/lib/mock-data';

import {

  mockComplianceControls,

  mockComplianceDashboardStats,

  mockComplianceEvidence,

  mockCompliancePacks,

  mockCompliancePolicies,

  mockComplianceRisks,

} from '@/lib/mock-data/compliance';

import type {

  ComplianceControl,

  ComplianceDashboardStats,

  ComplianceEvidence,

  CompliancePack,

  CompliancePolicy,

  ComplianceRisk,

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



const BASE = '/api/v1/compliance';



export const complianceApi = {

  getDashboardStats: () =>

    withMockFallback(

      () => api.get<ComplianceDashboardStats>(`${BASE}/stats`),

      mockComplianceDashboardStats,

    ),



  listPacks: () =>

    withMockFallback(

      () => api.get<CompliancePack[]>(`${BASE}/packs`),

      mockCompliancePacks,

    ),



  listControls: () =>

    withMockFallback(

      () => api.get<ComplianceControl[]>(`${BASE}/controls`),

      mockComplianceControls,

    ),



  listEvidence: () =>

    withMockFallback(

      () => api.get<ComplianceEvidence[]>(`${BASE}/evidence`),

      mockComplianceEvidence,

    ),



  listRisks: () =>

    withMockFallback(

      () => api.get<ComplianceRisk[]>(`${BASE}/risks`),

      mockComplianceRisks,

    ),



  listPolicies: () =>

    withMockFallback(

      () => api.get<CompliancePolicy[]>(`${BASE}/policies`),

      mockCompliancePolicies,

    ),

};


