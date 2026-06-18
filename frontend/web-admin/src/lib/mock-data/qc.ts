import type {
  CalibrationRecord,
  CapaRecord,
  QcChartData,
  QcDashboardStats,
  QcMaterial,
  QcRun,
} from '@/types';

export const mockQcDashboardStats: QcDashboardStats = {
  activeMaterials: 48,
  runsToday: 156,
  outOfRange: 3,
  openCapa: 2,
  materialsTrend: 2.1,
  runsTrend: 8.4,
  oorTrend: -25.0,
  capaTrend: 0,
};

export const mockQcMaterials: QcMaterial[] = [
  { id: 'qm1', code: 'QC-GLU-L1', name: 'Glucose Control L1', analyte: 'Glucose', level: 'L1', lotNumber: 'QC-LOT-2026-101', expiryDate: '2026-12-31', mean: 95, sd: 3.2, unit: 'mg/dL', status: 'active' },
  { id: 'qm2', code: 'QC-GLU-L2', name: 'Glucose Control L2', analyte: 'Glucose', level: 'L2', lotNumber: 'QC-LOT-2026-101', expiryDate: '2026-12-31', mean: 280, sd: 8.5, unit: 'mg/dL', status: 'active' },
  { id: 'qm3', code: 'QC-HGB-L1', name: 'Hemoglobin Control L1', analyte: 'Hemoglobin', level: 'L1', lotNumber: 'QC-LOT-2026-088', expiryDate: '2026-09-30', mean: 12.5, sd: 0.4, unit: 'g/dL', status: 'active' },
  { id: 'qm4', code: 'QC-TSH-L2', name: 'TSH Control L2', analyte: 'TSH', level: 'L2', lotNumber: 'QC-LOT-2025-220', expiryDate: '2026-05-15', mean: 4.8, sd: 0.3, unit: 'mIU/L', status: 'expired' },
  { id: 'qm5', code: 'QC-CREA-L1', name: 'Creatinine Control L1', analyte: 'Creatinine', level: 'L1', lotNumber: 'QC-LOT-2026-095', expiryDate: '2026-11-15', mean: 1.2, sd: 0.08, unit: 'mg/dL', status: 'active' },
];

export const mockQcRuns: QcRun[] = [
  { id: 'qr1', runNumber: 'QC-RUN-20260608-001', materialName: 'Glucose Control L1', analyte: 'Glucose', value: 96.2, unit: 'mg/dL', zScore: 0.38, status: 'in-range', runAt: '2026-06-08T06:30:00', operator: 'Tech - Anita', device: 'Cobas c501' },
  { id: 'qr2', runNumber: 'QC-RUN-20260608-002', materialName: 'Glucose Control L2', analyte: 'Glucose', value: 305.0, unit: 'mg/dL', zScore: 2.94, status: 'warning', runAt: '2026-06-08T06:32:00', operator: 'Tech - Anita', device: 'Cobas c501' },
  { id: 'qr3', runNumber: 'QC-RUN-20260608-003', materialName: 'Hemoglobin Control L1', analyte: 'Hemoglobin', value: 11.2, unit: 'g/dL', zScore: -3.25, status: 'reject', runAt: '2026-06-08T07:00:00', operator: 'Tech - Ravi', device: 'XN-1000' },
  { id: 'qr4', runNumber: 'QC-RUN-20260608-004', materialName: 'Creatinine Control L1', analyte: 'Creatinine', value: 1.18, unit: 'mg/dL', zScore: -0.25, status: 'in-range', runAt: '2026-06-08T07:15:00', operator: 'Tech - Anita', device: 'Cobas c501' },
  { id: 'qr5', runNumber: 'QC-RUN-20260608-005', materialName: 'Glucose Control L1', analyte: 'Glucose', value: 94.1, unit: 'mg/dL', zScore: -0.28, status: 'in-range', runAt: '2026-06-08T14:30:00', operator: 'Tech - Priya', device: 'Cobas c501' },
];

export const mockQcChartData: QcChartData = {
  materialName: 'Glucose Control L1',
  analyte: 'Glucose',
  mean: 95,
  sd: 3.2,
  unit: 'mg/dL',
  points: [
    { date: '2026-06-01', value: 94.5, zScore: -0.16, status: 'in-range' },
    { date: '2026-06-02', value: 96.8, zScore: 0.56, status: 'in-range' },
    { date: '2026-06-03', value: 93.2, zScore: -0.56, status: 'in-range' },
    { date: '2026-06-04', value: 97.5, zScore: 0.78, status: 'in-range' },
    { date: '2026-06-05', value: 101.2, zScore: 1.94, status: 'in-range' },
    { date: '2026-06-06', value: 88.5, zScore: -2.03, status: 'warning' },
    { date: '2026-06-07', value: 95.8, zScore: 0.25, status: 'in-range' },
    { date: '2026-06-08', value: 96.2, zScore: 0.38, status: 'in-range' },
  ],
};

export const mockCalibrationRecords: CalibrationRecord[] = [
  { id: 'cal1', deviceName: 'Cobas c501', deviceCode: 'DEV-COBAS-01', calibrationType: 'Full Calibration', performedAt: '2026-06-01T08:00:00', performedBy: 'Bio Med Engineer', nextDue: '2026-07-01', status: 'passed' },
  { id: 'cal2', deviceName: 'XN-1000', deviceCode: 'DEV-XN1000-01', calibrationType: 'Daily QC Check', performedAt: '2026-06-08T06:00:00', performedBy: 'Tech - Ravi', nextDue: '2026-06-09', status: 'passed' },
  { id: 'cal3', deviceName: 'Architect i2000', deviceCode: 'DEV-ARCH-01', calibrationType: 'Reagent Lot Change', performedAt: '2026-05-28T10:00:00', performedBy: 'Bio Med Engineer', nextDue: '2026-06-28', status: 'failed', notes: 'Calibration drift detected on TSH channel' },
  { id: 'cal4', deviceName: 'Cobas e411', deviceCode: 'DEV-COBAS-02', calibrationType: 'Scheduled Maintenance', performedAt: '2026-06-15T09:00:00', performedBy: 'Vendor Engineer', nextDue: '2026-06-15', status: 'scheduled' },
];

export const mockCapaRecords: CapaRecord[] = [
  { id: 'capa1', capaNumber: 'CAPA-2026-0012', title: 'Hb QC Reject - XN-1000', source: 'qc-failure', priority: 'high', status: 'investigating', openedAt: '2026-06-08', assignedTo: 'QC Manager', dueDate: '2026-06-15' },
  { id: 'capa2', capaNumber: 'CAPA-2026-0011', title: 'Glucose L2 Warning Trend', source: 'qc-failure', priority: 'medium', status: 'corrective-action', openedAt: '2026-06-05', assignedTo: 'Lab Supervisor', dueDate: '2026-06-12' },
  { id: 'capa3', capaNumber: 'CAPA-2026-0010', title: 'Reagent Storage Temperature Deviation', source: 'deviation', priority: 'critical', status: 'open', openedAt: '2026-06-07', assignedTo: 'Store Manager', dueDate: '2026-06-10' },
  { id: 'capa4', capaNumber: 'CAPA-2026-0008', title: 'Annual QC Audit Finding - Documentation', source: 'audit', priority: 'low', status: 'closed', openedAt: '2026-05-15', assignedTo: 'QC Manager', dueDate: '2026-05-30' },
];
