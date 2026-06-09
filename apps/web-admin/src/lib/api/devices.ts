import { api } from '@/lib/api/client';
import {
  fetchWithDelay,
  mockAstmConnection,
  mockAstmMessages,
  mockDeviceAdapters,
  mockDeviceDashboardStats,
  mockDeviceErrors,
  mockDeviceHealthMetrics,
  mockDeviceMessages,
  mockDevices,
  mockFailedMessages,
  mockHl7Connection,
  mockHl7Messages,
  mockMonitoringSnapshot,
  mockResultImports,
  mockResultImportStats,
} from '@/lib/mock-data/devices';
import type {
  AstmConnectionStatus,
  AstmMessage,
  Device,
  DeviceAdapter,
  DeviceDashboardStats,
  DeviceError,
  DeviceHealthMetrics,
  DeviceMessage,
  DeviceRegisterPayload,
  FailedMessage,
  Hl7ConnectionStatus,
  Hl7Message,
  MonitoringSnapshot,
  ResultImportRecord,
  ResultImportStats,
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

const BASE = '/api/v1/devices';

export const devicesApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<DeviceDashboardStats>(`${BASE}/stats`),
      mockDeviceDashboardStats,
    ),

  listDevices: () =>
    withMockFallback(() => api.get<Device[]>(BASE), mockDevices),

  getDevice: (id: string) =>
    withMockFallback(
      () => api.get<Device>(`${BASE}/${id}`),
      mockDevices.find((d) => d.id === id) ?? mockDevices[0],
    ),

  registerDevice: (payload: DeviceRegisterPayload) =>
    withMockFallback(
      () => api.post<Device>(BASE, payload),
      {
        id: `d${Date.now()}`,
        ...payload,
        branchId: 'b1',
        status: 'offline' as const,
        lastSeen: new Date().toISOString(),
        messagesPerMin: 0,
        errorRate: 0,
        queueDepth: 0,
        latencyMs: 0,
      },
      800,
    ),

  listErrors: () =>
    withMockFallback(() => api.get<DeviceError[]>(`${BASE}/errors`), mockDeviceErrors),

  getMonitoringSnapshot: () =>
    withMockFallback(
      () => api.get<MonitoringSnapshot>(`${BASE}/monitoring`),
      { ...mockMonitoringSnapshot, lastRefreshedAt: new Date().toISOString() },
      400,
    ),

  listMessages: () =>
    withMockFallback(
      () => api.get<DeviceMessage[]>(`${BASE}/messages`),
      mockDeviceMessages,
    ),

  listFailedMessages: () =>
    withMockFallback(
      () => api.get<FailedMessage[]>(`${BASE}/messages/failed`),
      mockFailedMessages,
    ),

  retryMessage: (id: string) =>
    withMockFallback(
      () => api.post<{ success: boolean }>(`${BASE}/messages/${id}/retry`),
      { success: true },
      500,
    ),

  bulkRetryFailed: () =>
    withMockFallback(
      () => api.post<{ retried: number }>(`${BASE}/messages/failed/retry-all`),
      { retried: mockFailedMessages.length },
      800,
    ),

  getHealthMetrics: () =>
    withMockFallback(
      () => api.get<DeviceHealthMetrics[]>(`${BASE}/health`),
      mockDeviceHealthMetrics,
    ),

  listAdapters: () =>
    withMockFallback(
      () => api.get<DeviceAdapter[]>(`${BASE}/adapters`),
      mockDeviceAdapters,
    ),

  updateAdapter: (id: string, fieldMapping: Record<string, string>) =>
    withMockFallback(
      () => api.patch<DeviceAdapter>(`${BASE}/adapters/${id}`, { fieldMapping }),
      {
        ...mockDeviceAdapters.find((a) => a.id === id)!,
        fieldMapping,
        updatedAt: new Date().toISOString(),
      },
      600,
    ),

  getAstmConnection: () =>
    withMockFallback(
      () => api.get<AstmConnectionStatus>(`${BASE}/protocols/astm/connection`),
      mockAstmConnection,
      300,
    ),

  listAstmMessages: () =>
    withMockFallback(
      () => api.get<AstmMessage[]>(`${BASE}/protocols/astm/messages`),
      mockAstmMessages,
      300,
    ),

  getHl7Connection: () =>
    withMockFallback(
      () => api.get<Hl7ConnectionStatus>(`${BASE}/protocols/hl7/connection`),
      mockHl7Connection,
      300,
    ),

  listHl7Messages: () =>
    withMockFallback(
      () => api.get<Hl7Message[]>(`${BASE}/protocols/hl7/messages`),
      mockHl7Messages,
      300,
    ),

  getResultImportStats: () =>
    withMockFallback(
      () => api.get<ResultImportStats>(`${BASE}/results/stats`),
      mockResultImportStats,
    ),

  listResultImports: () =>
    withMockFallback(
      () => api.get<ResultImportRecord[]>(`${BASE}/results`),
      mockResultImports,
    ),
};
