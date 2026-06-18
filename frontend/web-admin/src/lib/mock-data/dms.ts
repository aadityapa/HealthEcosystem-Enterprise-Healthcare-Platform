import type {
  DmsDashboardStats,
  DmsDocument,
  DmsRetentionPolicy,
  DmsSearchResult,
} from '@/types';

export const mockDmsDashboardStats: DmsDashboardStats = {
  totalDocuments: 284500,
  storageUsedGb: 1.2,
  retentionPolicies: 14,
  searchesToday: 842,
  documentsTrend: 8.5,
  storageTrend: 12.3,
  policiesTrend: 2.1,
  searchesTrend: 15.7,
};

export const mockDmsDocuments: DmsDocument[] = [
  { id: 'doc1', documentCode: 'DOC-2026-08421', title: 'CBC Report - Priya Sharma', category: 'Lab Report', patientName: 'Priya Sharma', uploadedBy: 'Lab System', uploadedAt: '2026-06-08T09:30:00', sizeMb: 0.8, status: 'active' },
  { id: 'doc2', documentCode: 'DOC-2026-08422', title: 'Consent Form - Rajesh Kumar', category: 'Consent', patientName: 'Rajesh Kumar', uploadedBy: 'Front Desk', uploadedAt: '2026-06-08T08:15:00', sizeMb: 1.2, status: 'active' },
  { id: 'doc3', documentCode: 'DOC-2026-08423', title: 'NABL Accreditation Certificate', category: 'Compliance', uploadedBy: 'Admin', uploadedAt: '2026-05-15T10:00:00', sizeMb: 2.4, status: 'active' },
  { id: 'doc4', documentCode: 'DOC-2025-12045', title: 'Vendor Agreement - Roche', category: 'Contract', uploadedBy: 'Procurement', uploadedAt: '2025-12-01T14:00:00', sizeMb: 4.5, status: 'archived' },
  { id: 'doc5', documentCode: 'DOC-2026-08424', title: 'Radiology Report - CT Chest', category: 'Radiology', patientName: 'Ananya Patel', uploadedBy: 'RIS System', uploadedAt: '2026-06-08T10:00:00', sizeMb: 3.1, status: 'pending-review' },
];

export const mockDmsSearchResults: DmsSearchResult[] = [
  { id: 'sr1', query: 'Priya Sharma CBC', resultCount: 4, searchedBy: 'Dr. Anita Desai', searchedAt: '2026-06-08T10:12:00', topMatch: 'CBC Report - Priya Sharma' },
  { id: 'sr2', query: 'NABL certificate', resultCount: 2, searchedBy: 'Compliance Officer', searchedAt: '2026-06-08T09:45:00', topMatch: 'NABL Accreditation Certificate' },
  { id: 'sr3', query: 'consent form 2026', resultCount: 128, searchedBy: 'Front Desk - Mumbai', searchedAt: '2026-06-08T09:30:00', topMatch: 'Consent Form - Rajesh Kumar' },
  { id: 'sr4', query: 'vendor agreement Roche', resultCount: 1, searchedBy: 'Procurement Head', searchedAt: '2026-06-08T08:00:00', topMatch: 'Vendor Agreement - Roche' },
  { id: 'sr5', query: 'CT chest report', resultCount: 15, searchedBy: 'Radiologist', searchedAt: '2026-06-08T07:15:00', topMatch: 'Radiology Report - CT Chest' },
];

export const mockDmsRetentionPolicies: DmsRetentionPolicy[] = [
  { id: 'rp1', policyCode: 'RET-LAB-REPORTS', name: 'Lab Reports Retention', documentType: 'Lab Report', retentionYears: 10, actionOnExpiry: 'Archive to cold storage', documentsAffected: 185000, status: 'active' },
  { id: 'rp2', policyCode: 'RET-CONSENT', name: 'Consent Forms', documentType: 'Consent', retentionYears: 7, actionOnExpiry: 'Secure delete', documentsAffected: 42000, status: 'active' },
  { id: 'rp3', policyCode: 'RET-CONTRACTS', name: 'Vendor Contracts', documentType: 'Contract', retentionYears: 15, actionOnExpiry: 'Archive', documentsAffected: 850, status: 'active' },
  { id: 'rp4', policyCode: 'RET-RADIOLOGY', name: 'Radiology Images', documentType: 'Radiology', retentionYears: 10, actionOnExpiry: 'PACS archive', documentsAffected: 52000, status: 'active' },
  { id: 'rp5', policyCode: 'RET-AUDIT-LOGS', name: 'Audit Trail Logs', documentType: 'Audit', retentionYears: 5, actionOnExpiry: 'Purge', documentsAffected: 0, status: 'draft' },
];
