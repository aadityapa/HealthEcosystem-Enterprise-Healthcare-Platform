import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockAiChatSessions,
  mockAiDashboardStats,
  mockClinicalAiInsights,
  mockOperationalAiInsights,
  mockVoiceAssistantSessions,
  mockWhatsAppConversations,
} from '@/lib/mock-data/ai';
import type {
  AiChatSession,
  AiDashboardStats,
  ClinicalAiInsight,
  OperationalAiInsight,
  VoiceAssistantSession,
  WhatsAppConversation,
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

const BASE = '/api/v1/ai';

export const aiApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<AiDashboardStats>(`${BASE}/stats`),
      mockAiDashboardStats,
    ),

  listClinicalInsights: () =>
    withMockFallback(
      () => api.get<ClinicalAiInsight[]>(`${BASE}/clinical`),
      mockClinicalAiInsights,
    ),

  listOperationalInsights: () =>
    withMockFallback(
      () => api.get<OperationalAiInsight[]>(`${BASE}/operational`),
      mockOperationalAiInsights,
    ),

  listChatSessions: () =>
    withMockFallback(
      () => api.get<AiChatSession[]>(`${BASE}/chat`),
      mockAiChatSessions,
    ),

  listWhatsAppConversations: () =>
    withMockFallback(
      () => api.get<WhatsAppConversation[]>(`${BASE}/whatsapp`),
      mockWhatsAppConversations,
    ),

  listVoiceSessions: () =>
    withMockFallback(
      () => api.get<VoiceAssistantSession[]>(`${BASE}/voice`),
      mockVoiceAssistantSessions,
    ),
};
