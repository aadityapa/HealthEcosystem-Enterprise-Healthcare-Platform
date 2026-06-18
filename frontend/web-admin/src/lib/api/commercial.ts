import { api } from '@/lib/api/client';

import { fetchWithDelay } from '@/lib/mock-data';

import {

  mockCommercialDashboardStats,

  mockCommercialPartners,

  mockCommercialPlans,

  mockCommercialQuotations,

  mockCommercialRevenue,

  mockCommercialSubscriptions,

} from '@/lib/mock-data/commercial';

import type {

  CommercialDashboardStats,

  CommercialPartner,

  CommercialPlan,

  CommercialQuotation,

  CommercialRevenue,

  CommercialSubscription,

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



const BASE = '/api/v1/commercial';



export const commercialApi = {

  getDashboardStats: () =>

    withMockFallback(

      () => api.get<CommercialDashboardStats>(`${BASE}/stats`),

      mockCommercialDashboardStats,

    ),



  listPlans: () =>

    withMockFallback(

      () => api.get<CommercialPlan[]>(`${BASE}/plans`),

      mockCommercialPlans,

    ),



  listSubscriptions: () =>

    withMockFallback(

      () => api.get<CommercialSubscription[]>(`${BASE}/subscriptions`),

      mockCommercialSubscriptions,

    ),



  listQuotations: () =>

    withMockFallback(

      () => api.get<CommercialQuotation[]>(`${BASE}/quotations`),

      mockCommercialQuotations,

    ),



  listPartners: () =>

    withMockFallback(

      () => api.get<CommercialPartner[]>(`${BASE}/partners`),

      mockCommercialPartners,

    ),



  listRevenue: () =>

    withMockFallback(

      () => api.get<CommercialRevenue[]>(`${BASE}/revenue`),

      mockCommercialRevenue,

    ),

};


