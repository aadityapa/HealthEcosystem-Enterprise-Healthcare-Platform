import { api } from '@/lib/api/client';

import { fetchWithDelay } from '@/lib/mock-data';

import {

  mockCustomerSuccessDashboardStats,

  mockKnowledgeArticles,

  mockMigrationRecords,

  mockOnboardingRecords,

  mockSupportTickets,

  mockTrainingSessions,

} from '@/lib/mock-data/customer-success';

import type {

  CustomerSuccessDashboardStats,

  KnowledgeArticle,

  MigrationRecord,

  OnboardingRecord,

  SupportTicket,

  TrainingSession,

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



const BASE = '/api/v1/customer-success';



export const customerSuccessApi = {

  getDashboardStats: () =>

    withMockFallback(

      () => api.get<CustomerSuccessDashboardStats>(`${BASE}/stats`),

      mockCustomerSuccessDashboardStats,

    ),



  listOnboarding: () =>

    withMockFallback(

      () => api.get<OnboardingRecord[]>(`${BASE}/onboarding`),

      mockOnboardingRecords,

    ),



  listMigrations: () =>

    withMockFallback(

      () => api.get<MigrationRecord[]>(`${BASE}/migration`),

      mockMigrationRecords,

    ),



  listTraining: () =>

    withMockFallback(

      () => api.get<TrainingSession[]>(`${BASE}/training`),

      mockTrainingSessions,

    ),



  listKnowledge: () =>

    withMockFallback(

      () => api.get<KnowledgeArticle[]>(`${BASE}/knowledge`),

      mockKnowledgeArticles,

    ),



  listTickets: () =>

    withMockFallback(

      () => api.get<SupportTicket[]>(`${BASE}/tickets`),

      mockSupportTickets,

    ),

};


