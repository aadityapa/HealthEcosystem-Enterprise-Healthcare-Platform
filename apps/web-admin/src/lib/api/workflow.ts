import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockAutomationRules,
  mockWorkflowDashboardStats,
  mockWorkflowDefinitions,
  mockWorkflowInstances,
  mockWorkflowTasks,
} from '@/lib/mock-data/workflow';
import type {
  AutomationRule,
  WorkflowDashboardStats,
  WorkflowDefinition,
  WorkflowInstance,
  WorkflowTask,
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

const BASE = '/api/v1/workflow';

export const workflowApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<WorkflowDashboardStats>(`${BASE}/stats`),
      mockWorkflowDashboardStats,
    ),

  listDefinitions: () =>
    withMockFallback(
      () => api.get<WorkflowDefinition[]>(`${BASE}/definitions`),
      mockWorkflowDefinitions,
    ),

  listInstances: () =>
    withMockFallback(
      () => api.get<WorkflowInstance[]>(`${BASE}/instances`),
      mockWorkflowInstances,
    ),

  listTasks: () =>
    withMockFallback(
      () => api.get<WorkflowTask[]>(`${BASE}/tasks`),
      mockWorkflowTasks,
    ),

  listAutomationRules: () =>
    withMockFallback(
      () => api.get<AutomationRule[]>(`${BASE}/automation`),
      mockAutomationRules,
    ),
};
