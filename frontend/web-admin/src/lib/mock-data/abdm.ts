import type {
  AbdmDashboardStats,
  AbhaRecord,
  ConsentRecord,
  FhirBundle,
  HealthExchangeRecord,
} from '@/types';

export const mockAbdmDashboardStats: AbdmDashboardStats = {
  abhaLinked: 12847,
  consentRequests: 34,
  fhirBundlesSent: 892,
  exchangeTransactions: 156,
  abhaTrend: 18.5,
  consentTrend: 12.0,
  fhirTrend: 22.3,
  exchangeTrend: 15.8,
};

export const mockAbhaRecords: AbhaRecord[] = [
  { id: 'abha1', patientName: 'Priya Sharma', patientUhid: 'UHID-2024-001847', abhaNumber: '91-1234-5678-9012', abhaAddress: 'priyasharma@abdm', linkedAt: '2026-03-15', kycStatus: 'verified', status: 'active' },
  { id: 'abha2', patientName: 'Rajesh Kumar', patientUhid: 'UHID-2024-002156', abhaNumber: '91-2345-6789-0123', abhaAddress: 'rajeshkumar@abdm', linkedAt: '2026-04-20', kycStatus: 'verified', status: 'active' },
  { id: 'abha3', patientName: 'Ananya Patel', patientUhid: 'UHID-2024-003421', abhaNumber: '91-3456-7890-1234', abhaAddress: 'ananyapatel@abdm', linkedAt: '2026-05-10', kycStatus: 'pending', status: 'active' },
  { id: 'abha4', patientName: 'Mohammed Hassan', patientUhid: 'UHID-2024-004892', abhaNumber: '91-4567-8901-2345', abhaAddress: 'mhassan@abdm', linkedAt: '2026-02-28', kycStatus: 'verified', status: 'active' },
  { id: 'abha5', patientName: 'Vikram Singh', patientUhid: 'UHID-2024-006201', abhaNumber: '91-5678-9012-3456', abhaAddress: 'vikramsingh@abdm', linkedAt: '2026-06-01', kycStatus: 'failed', status: 'inactive' },
];

export const mockConsentRecords: ConsentRecord[] = [
  { id: 'cns1', consentId: 'CNS-2026-08921', patientName: 'Priya Sharma', abhaAddress: 'priyasharma@abdm', purpose: 'Care Management', hiTypes: ['DiagnosticReport', 'Prescription'], requestedAt: '2026-06-08T08:00:00', expiresAt: '2026-07-08', status: 'granted' },
  { id: 'cns2', consentId: 'CNS-2026-08922', patientName: 'Rajesh Kumar', abhaAddress: 'rajeshkumar@abdm', purpose: 'Self Requested', hiTypes: ['OPConsultation', 'DiagnosticReport'], requestedAt: '2026-06-08T09:30:00', expiresAt: '2026-06-15', status: 'requested' },
  { id: 'cns3', consentId: 'CNS-2026-08920', patientName: 'Mohammed Hassan', abhaAddress: 'mhassan@abdm', purpose: 'Public Health', hiTypes: ['HealthDocumentRecord'], requestedAt: '2026-06-07T14:00:00', expiresAt: '2026-06-07', status: 'expired' },
  { id: 'cns4', consentId: 'CNS-2026-08918', patientName: 'Ananya Patel', abhaAddress: 'ananyapatel@abdm', purpose: 'Care Management', hiTypes: ['DiagnosticReport'], requestedAt: '2026-06-06T10:00:00', expiresAt: '2026-07-06', status: 'denied' },
  { id: 'cns5', consentId: 'CNS-2026-08915', patientName: 'Kavita Menon', abhaAddress: 'kavitamenon@abdm', purpose: 'Research', hiTypes: ['DiagnosticReport', 'DischargeSummary'], requestedAt: '2026-06-05T11:00:00', expiresAt: '2026-12-05', status: 'revoked' },
];

export const mockFhirBundles: FhirBundle[] = [
  { id: 'fb1', bundleId: 'BND-2026-45210', patientName: 'Priya Sharma', bundleType: 'document', resourceCount: 5, sentAt: '2026-06-08T07:30:00', destination: 'ABDM Gateway', status: 'acknowledged' },
  { id: 'fb2', bundleId: 'BND-2026-45211', patientName: 'Rajesh Kumar', bundleType: 'collection', resourceCount: 8, sentAt: '2026-06-08T08:15:00', destination: 'ABDM Gateway', status: 'sent' },
  { id: 'fb3', bundleId: 'BND-2026-45209', patientName: 'Mohammed Hassan', bundleType: 'document', resourceCount: 3, sentAt: '2026-06-07T16:45:00', destination: 'External HIU', status: 'failed' },
  { id: 'fb4', bundleId: 'BND-2026-45208', patientName: 'Ananya Patel', bundleType: 'transaction', resourceCount: 12, sentAt: '2026-06-07T11:00:00', destination: 'ABDM Gateway', status: 'acknowledged' },
  { id: 'fb5', bundleId: 'BND-2026-45212', patientName: 'Vikram Singh', bundleType: 'document', resourceCount: 4, sentAt: '2026-06-08T09:00:00', destination: 'ABDM Gateway', status: 'pending' },
];

export const mockHealthExchangeRecords: HealthExchangeRecord[] = [
  { id: 'hx1', transactionId: 'HIE-2026-12042', type: 'push', patientName: 'Priya Sharma', abhaAddress: 'priyasharma@abdm', hipName: 'HealthEcosystem LIMS', hiuName: 'Apollo Hospitals', initiatedAt: '2026-06-08T07:30:00', status: 'success' },
  { id: 'hx2', transactionId: 'HIE-2026-12043', type: 'pull', patientName: 'Rajesh Kumar', abhaAddress: 'rajeshkumar@abdm', hipName: 'Fortis Healthcare', hiuName: 'HealthEcosystem LIMS', initiatedAt: '2026-06-08T09:00:00', status: 'pending' },
  { id: 'hx3', transactionId: 'HIE-2026-12041', type: 'notify', patientName: 'Mohammed Hassan', abhaAddress: 'mhassan@abdm', hipName: 'HealthEcosystem LIMS', hiuName: 'Manipal Hospital', initiatedAt: '2026-06-07T16:00:00', status: 'success' },
  { id: 'hx4', transactionId: 'HIE-2026-12040', type: 'push', patientName: 'Ananya Patel', abhaAddress: 'ananyapatel@abdm', hipName: 'HealthEcosystem LIMS', hiuName: 'ABDM Sandbox', initiatedAt: '2026-06-07T11:30:00', status: 'failed' },
  { id: 'hx5', transactionId: 'HIE-2026-12039', type: 'pull', patientName: 'Kavita Menon', abhaAddress: 'kavitamenon@abdm', hipName: 'Lilavati Hospital', hiuName: 'HealthEcosystem LIMS', initiatedAt: '2026-06-06T14:00:00', status: 'success' },
];
