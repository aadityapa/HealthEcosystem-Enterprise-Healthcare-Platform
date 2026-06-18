import type {
  CapacityMetric,
  ObservabilityDashboardStats,
  ServiceMapNode,
  SlaMetric,
  TraceRecord,
} from '@/types';

export const mockObservabilityDashboardStats: ObservabilityDashboardStats = {
  totalTraces: 284500,
  errorRate: 0.42,
  slaCompliance: 99.2,
  activeServices: 34,
  tracesTrend: 18.5,
  errorTrend: -12.3,
  slaTrend: 0.8,
  servicesTrend: 6.2,
};

export const mockTraceRecords: TraceRecord[] = [
  { id: 'tr1', traceId: 'a3f8c2e1-4b9d', service: 'lims-service', operation: 'POST /orders', durationMs: 142, status: 'ok', timestamp: '2026-06-08T10:15:00', spans: 8 },
  { id: 'tr2', traceId: 'b7d2a9f0-1c3e', service: 'billing-service', operation: 'GET /invoices', durationMs: 89, status: 'ok', timestamp: '2026-06-08T10:14:32', spans: 5 },
  { id: 'tr3', traceId: 'c1e5b8d4-7f2a', service: 'device-service', operation: 'POST /messages', durationMs: 1240, status: 'error', timestamp: '2026-06-08T10:13:58', spans: 12 },
  { id: 'tr4', traceId: 'd9a3f6c2-8b1d', service: 'auth-service', operation: 'POST /login', durationMs: 56, status: 'ok', timestamp: '2026-06-08T10:12:45', spans: 3 },
  { id: 'tr5', traceId: 'e4c7b2a8-5d9f', service: 'analytics-service', operation: 'GET /revenue', durationMs: 3200, status: 'timeout', timestamp: '2026-06-08T10:11:20', spans: 15 },
];

export const mockSlaMetrics: SlaMetric[] = [
  { id: 'sla1', service: 'lims-service', metric: 'API Availability', target: 99.9, actual: 99.95, compliance: 100, period: 'June 2026', status: 'met' },
  { id: 'sla2', service: 'billing-service', metric: 'P95 Latency (ms)', target: 200, actual: 185, compliance: 100, period: 'June 2026', status: 'met' },
  { id: 'sla3', service: 'device-service', metric: 'Message Processing', target: 99.5, actual: 98.8, compliance: 92, period: 'June 2026', status: 'at-risk' },
  { id: 'sla4', service: 'analytics-service', metric: 'Query Response', target: 5000, actual: 6200, compliance: 78, period: 'June 2026', status: 'breached' },
  { id: 'sla5', service: 'auth-service', metric: 'Login Success Rate', target: 99.9, actual: 99.97, compliance: 100, period: 'June 2026', status: 'met' },
];

export const mockServiceMapNodes: ServiceMapNode[] = [
  { id: 'sm1', service: 'api-gateway', namespace: 'platform', health: 'healthy', requestsPerMin: 4200, latencyP95: 45, dependencies: 12 },
  { id: 'sm2', service: 'lims-service', namespace: 'core', health: 'healthy', requestsPerMin: 1850, latencyP95: 120, dependencies: 5 },
  { id: 'sm3', service: 'billing-service', namespace: 'core', health: 'healthy', requestsPerMin: 920, latencyP95: 95, dependencies: 4 },
  { id: 'sm4', service: 'device-service', namespace: 'integration', health: 'degraded', requestsPerMin: 3400, latencyP95: 280, dependencies: 3 },
  { id: 'sm5', service: 'analytics-service', namespace: 'data', health: 'degraded', requestsPerMin: 450, latencyP95: 2100, dependencies: 6 },
];

export const mockCapacityMetrics: CapacityMetric[] = [
  { id: 'cap1', resource: 'CPU', cluster: 'prod-mumbai', utilization: 68, capacity: 100, forecastDays: 45, status: 'normal' },
  { id: 'cap2', resource: 'Memory', cluster: 'prod-mumbai', utilization: 82, capacity: 100, forecastDays: 22, status: 'warning' },
  { id: 'cap3', resource: 'Storage', cluster: 'prod-mumbai', utilization: 71, capacity: 100, forecastDays: 60, status: 'normal' },
  { id: 'cap4', resource: 'CPU', cluster: 'prod-hyderabad', utilization: 91, capacity: 100, forecastDays: 8, status: 'critical' },
  { id: 'cap5', resource: 'Database Connections', cluster: 'prod-mumbai', utilization: 76, capacity: 100, forecastDays: 30, status: 'normal' },
];
