import type {
  PacsNode,
  RadiologyDashboardStats,
  RadiologyReport,
  RadiologyStudy,
  RadiologyWorklistItem,
} from '@/types';

export const mockRadiologyDashboardStats: RadiologyDashboardStats = {
  studiesToday: 84,
  pendingReports: 12,
  avgReportTat: 2.4,
  pacsOnline: true,
  studiesTrend: 11.5,
  pendingTrend: -18.0,
  tatTrend: -8.3,
};

export const mockRadiologyStudies: RadiologyStudy[] = [
  { id: 'rs1', accessionNumber: 'RAD-2026-08421', patientName: 'Priya Sharma', modality: 'MRI', studyDescription: 'Brain MRI with contrast', scheduledAt: '2026-06-08T11:00:00', status: 'scheduled', branch: 'Mumbai Central Lab' },
  { id: 'rs2', accessionNumber: 'RAD-2026-08422', patientName: 'Rajesh Kumar', modality: 'CT', studyDescription: 'Chest CT - HRCT', scheduledAt: '2026-06-08T10:30:00', status: 'in-progress', branch: 'Delhi NCR Diagnostic' },
  { id: 'rs3', accessionNumber: 'RAD-2026-08423', patientName: 'Ananya Patel', modality: 'X-Ray', studyDescription: 'Chest PA View', scheduledAt: '2026-06-08T09:00:00', status: 'completed', branch: 'Bangalore Health Hub' },
  { id: 'rs4', accessionNumber: 'RAD-2026-08424', patientName: 'Vikram Singh', modality: 'Ultrasound', studyDescription: 'Abdominal Ultrasound', scheduledAt: '2026-06-08T14:00:00', status: 'scheduled', branch: 'Mumbai Central Lab' },
  { id: 'rs5', accessionNumber: 'RAD-2026-08420', patientName: 'Lakshmi Reddy', modality: 'Mammography', studyDescription: 'Bilateral Screening', scheduledAt: '2026-06-07T16:00:00', status: 'cancelled', branch: 'Chennai South Branch' },
];

export const mockRadiologyWorklist: RadiologyWorklistItem[] = [
  { id: 'wl1', accessionNumber: 'RAD-2026-08418', patientName: 'Ramesh Iyer', modality: 'CT', priority: 'stat', assignedTo: 'Dr. Sanjay Mehta', receivedAt: '2026-06-08T08:30:00', status: 'reading' },
  { id: 'wl2', accessionNumber: 'RAD-2026-08419', patientName: 'Kavita Desai', modality: 'MRI', priority: 'urgent', assignedTo: undefined, receivedAt: '2026-06-08T09:15:00', status: 'pending' },
  { id: 'wl3', accessionNumber: 'RAD-2026-08417', patientName: 'Mohammed Ali', modality: 'X-Ray', priority: 'routine', assignedTo: 'Dr. Priya Nair', receivedAt: '2026-06-08T07:45:00', status: 'preliminary' },
  { id: 'wl4', accessionNumber: 'RAD-2026-08416', patientName: 'Sunita Rao', modality: 'Ultrasound', priority: 'routine', assignedTo: 'Dr. Anil Kapoor', receivedAt: '2026-06-07T17:00:00', status: 'finalized' },
  { id: 'wl5', accessionNumber: 'RAD-2026-08415', patientName: 'Arjun Pillai', modality: 'CT', priority: 'urgent', assignedTo: 'Dr. Sanjay Mehta', receivedAt: '2026-06-07T15:30:00', status: 'finalized' },
];

export const mockPacsNodes: PacsNode[] = [
  { id: 'pacs1', name: 'PACS Primary - Mumbai', aeTitle: 'HEALTH_MUM_PACS', host: '10.0.1.50', port: 104, modality: 'Multi-modality', studiesStored: 245000, status: 'online', lastSync: '2026-06-08T10:30:00' },
  { id: 'pacs2', name: 'PACS Secondary - Delhi', aeTitle: 'HEALTH_DEL_PACS', host: '10.0.2.50', port: 104, modality: 'Multi-modality', studiesStored: 189000, status: 'online', lastSync: '2026-06-08T10:28:00' },
  { id: 'pacs3', name: 'Modality Worklist - CT', aeTitle: 'HEALTH_CT_MWL', host: '10.0.1.51', port: 105, modality: 'CT', studiesStored: 0, status: 'online', lastSync: '2026-06-08T10:25:00' },
  { id: 'pacs4', name: 'Modality Worklist - MRI', aeTitle: 'HEALTH_MRI_MWL', host: '10.0.1.52', port: 105, modality: 'MRI', studiesStored: 0, status: 'degraded', lastSync: '2026-06-08T09:00:00' },
  { id: 'pacs5', name: 'Archive Node - Bangalore', aeTitle: 'HEALTH_BLR_ARCH', host: '10.0.3.50', port: 104, modality: 'Archive', studiesStored: 98000, status: 'offline', lastSync: '2026-06-07T22:00:00' },
];

export const mockRadiologyReports: RadiologyReport[] = [
  { id: 'rr1', accessionNumber: 'RAD-2026-08416', patientName: 'Sunita Rao', modality: 'Ultrasound', studyDescription: 'Pelvic Ultrasound', radiologist: 'Dr. Anil Kapoor', reportedAt: '2026-06-08T08:00:00', status: 'final' },
  { id: 'rr2', accessionNumber: 'RAD-2026-08415', patientName: 'Arjun Pillai', modality: 'CT', studyDescription: 'CT Abdomen & Pelvis', radiologist: 'Dr. Sanjay Mehta', reportedAt: '2026-06-08T07:30:00', status: 'final' },
  { id: 'rr3', accessionNumber: 'RAD-2026-08417', patientName: 'Mohammed Ali', modality: 'X-Ray', studyDescription: 'Chest PA View', radiologist: 'Dr. Priya Nair', reportedAt: '2026-06-08T09:45:00', status: 'preliminary' },
  { id: 'rr4', accessionNumber: 'RAD-2026-08414', patientName: 'Deepa Menon', modality: 'MRI', studyDescription: 'Knee MRI', radiologist: 'Dr. Sanjay Mehta', reportedAt: '2026-06-07T18:00:00', status: 'final' },
  { id: 'rr5', accessionNumber: 'RAD-2026-08413', patientName: 'Ganesh Iyer', modality: 'CT', studyDescription: 'CT Head', radiologist: 'Dr. Priya Nair', reportedAt: '2026-06-07T16:30:00', status: 'amended' },
];
