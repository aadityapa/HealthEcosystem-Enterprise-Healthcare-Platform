import type {
  DataExport,
  DataLakeDataset,
  DataPipeline,
  DataPlatformDashboardStats,
  WarehouseTable,
} from '@/types';

export const mockDataPlatformDashboardStats: DataPlatformDashboardStats = {
  activePipelines: 24,
  lakeSizeTb: 4.8,
  warehouseQueriesToday: 1842,
  exportsScheduled: 12,
  pipelinesTrend: 8.3,
  lakeTrend: 15.2,
  queriesTrend: 22.1,
  exportsTrend: 4.5,
};

export const mockDataPipelines: DataPipeline[] = [
  { id: 'dp1', pipelineCode: 'PL-ORDERS-ETL', name: 'Orders Bronze → Silver', source: 'PostgreSQL orders', destination: 'S3 silver/orders', schedule: 'Every 15 min', lastRun: '2026-06-08T10:00:00', status: 'success' },
  { id: 'dp2', pipelineCode: 'PL-RESULTS-ETL', name: 'Lab Results Ingestion', source: 'Kafka lab-results', destination: 'S3 bronze/results', schedule: 'Streaming', lastRun: '2026-06-08T10:14:00', status: 'running' },
  { id: 'dp3', pipelineCode: 'PL-BILLING-AGG', name: 'Billing Daily Aggregation', source: 'S3 silver/billing', destination: 'ClickHouse revenue', schedule: 'Daily 02:00', lastRun: '2026-06-08T02:00:00', status: 'success' },
  { id: 'dp4', pipelineCode: 'PL-DEVICE-LOGS', name: 'Device Message Archive', source: 'Kafka device-msgs', destination: 'S3 bronze/devices', schedule: 'Hourly', lastRun: '2026-06-08T10:00:00', status: 'failed' },
  { id: 'dp5', pipelineCode: 'PL-CRM-SYNC', name: 'CRM Referral Sync', source: 'crm-service API', destination: 'S3 silver/referrals', schedule: 'Every 30 min', lastRun: '2026-06-08T09:30:00', status: 'idle' },
];

export const mockDataLakeDatasets: DataLakeDataset[] = [
  { id: 'dl1', datasetCode: 'DS-ORDERS-BRONZE', name: 'orders_raw', format: 'Parquet', sizeGb: 128, records: 4200000, lastUpdated: '2026-06-08T10:00:00', tier: 'bronze' },
  { id: 'dl2', datasetCode: 'DS-ORDERS-SILVER', name: 'orders_cleaned', format: 'Delta', sizeGb: 96, records: 4180000, lastUpdated: '2026-06-08T10:00:00', tier: 'silver' },
  { id: 'dl3', datasetCode: 'DS-RESULTS-BRONZE', name: 'lab_results_raw', format: 'Parquet', sizeGb: 512, records: 18500000, lastUpdated: '2026-06-08T10:14:00', tier: 'bronze' },
  { id: 'dl4', datasetCode: 'DS-REVENUE-GOLD', name: 'revenue_analytics', format: 'Delta', sizeGb: 24, records: 890000, lastUpdated: '2026-06-08T02:00:00', tier: 'gold' },
  { id: 'dl5', datasetCode: 'DS-DEVICE-LOGS', name: 'device_messages', format: 'JSON', sizeGb: 340, records: 52000000, lastUpdated: '2026-06-08T10:00:00', tier: 'bronze' },
];

export const mockWarehouseTables: WarehouseTable[] = [
  { id: 'wh1', tableName: 'fact_orders', schema: 'analytics', rows: 4200000, sizeGb: 18, lastRefreshed: '2026-06-08T02:00:00', refreshSchedule: 'Daily' },
  { id: 'wh2', tableName: 'fact_revenue', schema: 'analytics', rows: 890000, sizeGb: 4.2, lastRefreshed: '2026-06-08T02:00:00', refreshSchedule: 'Daily' },
  { id: 'wh3', tableName: 'dim_patients', schema: 'analytics', rows: 128470, sizeGb: 1.8, lastRefreshed: '2026-06-08T00:00:00', refreshSchedule: 'Hourly' },
  { id: 'wh4', tableName: 'fact_qc_runs', schema: 'analytics', rows: 245000, sizeGb: 2.1, lastRefreshed: '2026-06-08T06:00:00', refreshSchedule: 'Every 6 hrs' },
  { id: 'wh5', tableName: 'dim_branches', schema: 'analytics', rows: 28, sizeGb: 0.01, lastRefreshed: '2026-06-07T00:00:00', refreshSchedule: 'Weekly' },
];

export const mockDataExports: DataExport[] = [
  { id: 'ex1', exportCode: 'EXP-REV-MONTHLY', name: 'Monthly Revenue Report', format: 'CSV', destination: 'S3 exports/revenue', schedule: '1st of month', lastExport: '2026-06-01T06:00:00', status: 'active' },
  { id: 'ex2', exportCode: 'EXP-QC-WEEKLY', name: 'QC Summary Export', format: 'XLSX', destination: 'SFTP partner/qc', schedule: 'Every Monday', lastExport: '2026-06-02T06:00:00', status: 'active' },
  { id: 'ex3', exportCode: 'EXP-PATIENT-PORT', name: 'Patient Data Portability', format: 'FHIR Bundle', destination: 'Secure download', schedule: 'On demand', lastExport: '2026-06-07T14:30:00', status: 'active' },
  { id: 'ex4', exportCode: 'EXP-DEVICE-LOGS', name: 'Device Audit Logs', format: 'JSON', destination: 'S3 compliance/logs', schedule: 'Daily', lastExport: '2026-06-08T03:00:00', status: 'failed' },
  { id: 'ex5', exportCode: 'EXP-ABDM-SUBMIT', name: 'ABDM Registry Sync', format: 'FHIR', destination: 'ABDM gateway', schedule: 'Every 4 hrs', lastExport: '2026-06-08T08:00:00', status: 'paused' },
];
