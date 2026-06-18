import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import { getAgentsByType, mockAgentsDashboardStats, mockAiAgents } from '@/lib/mock-data/agents';
import type { AgentType, AgentsDashboardStats, AiAgentRecord } from '@/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

async function withMockFallback<T>(apiCall: () => Promise<T>, mockData: T, delay = 600): Promise<T> {
  if (USE_MOCK) return fetchWithDelay(mockData, delay);
  try {
    return await apiCall();
  } catch {
    return fetchWithDelay(mockData, delay);
  }
}

const BASE = '/api/v1/agents';

export const agentsApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<AgentsDashboardStats>(`${BASE}/stats`),
      mockAgentsDashboardStats,
    ),

  listAgents: () =>
    withMockFallback(
      () => api.get<AiAgentRecord[]>(`${BASE}`),
      mockAiAgents,
    ),

  listAgentsByType: (type: AgentType) =>
    withMockFallback(
      () => api.get<AiAgentRecord[]>(`${BASE}/${type}`),
      getAgentsByType(type),
    ),
};
