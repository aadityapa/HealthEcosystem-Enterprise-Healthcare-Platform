import { api } from '@/lib/api/client';

import { fetchWithDelay } from '@/lib/mock-data';

import {

  mockPentestReports,

  mockSecurityCertificates,

  mockSecurityDashboardStats,

  mockSecurityIncidents,

  mockSecurityThreats,

  mockSecurityVulnerabilities,

} from '@/lib/mock-data/security';

import type {

  PentestReport,

  SecurityCertificate,

  SecurityDashboardStats,

  SecurityIncident,

  SecurityThreat,

  SecurityVulnerability,

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



const BASE = '/api/v1/security';



export const securityApi = {

  getDashboardStats: () =>

    withMockFallback(

      () => api.get<SecurityDashboardStats>(`${BASE}/stats`),

      mockSecurityDashboardStats,

    ),



  listIncidents: () =>

    withMockFallback(

      () => api.get<SecurityIncident[]>(`${BASE}/incidents`),

      mockSecurityIncidents,

    ),



  listThreats: () =>

    withMockFallback(

      () => api.get<SecurityThreat[]>(`${BASE}/threats`),

      mockSecurityThreats,

    ),



  listVulnerabilities: () =>

    withMockFallback(

      () => api.get<SecurityVulnerability[]>(`${BASE}/vulnerabilities`),

      mockSecurityVulnerabilities,

    ),



  listPentestReports: () =>

    withMockFallback(

      () => api.get<PentestReport[]>(`${BASE}/pentest`),

      mockPentestReports,

    ),



  listCertificates: () =>

    withMockFallback(

      () => api.get<SecurityCertificate[]>(`${BASE}/certificates`),

      mockSecurityCertificates,

    ),

};


