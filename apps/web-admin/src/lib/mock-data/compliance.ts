import type {
  ComplianceControl,
  ComplianceDashboardStats,
  ComplianceEvidence,
  CompliancePack,
  CompliancePolicy,
  ComplianceRisk,
} from '@/types';

export const mockComplianceDashboardStats: ComplianceDashboardStats = {
  activePacks: 5,
  controlsCompliant: 142,
  evidencePending: 8,
  openRisks: 6,
  packsTrend: 0,
  complianceTrend: 4.2,
  evidenceTrend: -12.5,
  risksTrend: -8.3,
};

export const mockCompliancePacks: CompliancePack[] = [
  { id: 'cp1', packCode: 'PACK-IN-DPDP', name: 'India DPDP Act 2023', framework: 'DPDP', region: 'India', controlsCount: 48, compliancePercent: 94.2, status: 'active' },
  { id: 'cp2', packCode: 'PACK-IN-HIPAA', name: 'HIPAA Alignment (India)', framework: 'HIPAA', region: 'India', controlsCount: 62, compliancePercent: 88.7, status: 'active' },
  { id: 'cp3', packCode: 'PACK-ISO27001', name: 'ISO 27001:2022', framework: 'ISO 27001', region: 'Global', controlsCount: 114, compliancePercent: 82.5, status: 'active' },
  { id: 'cp4', packCode: 'PACK-UAE-HL', name: 'UAE Health Data Law', framework: 'UAE-HL', region: 'UAE', controlsCount: 36, compliancePercent: 76.4, status: 'active' },
  { id: 'cp5', packCode: 'PACK-GDPR', name: 'GDPR (EU Tenants)', framework: 'GDPR', region: 'EU', controlsCount: 54, compliancePercent: 91.0, status: 'draft' },
];

export const mockComplianceControls: ComplianceControl[] = [
  { id: 'cc1', controlCode: 'AC-01', name: 'Access Control Policy', framework: 'ISO 27001', category: 'Access Control', owner: 'Security Team', lastAssessed: '2026-05-20T00:00:00Z', status: 'compliant' },
  { id: 'cc2', controlCode: 'DP-03', name: 'Data Retention Limits', framework: 'DPDP', category: 'Data Protection', owner: 'Compliance Officer', lastAssessed: '2026-06-01T00:00:00Z', status: 'compliant' },
  { id: 'cc3', controlCode: 'AU-02', name: 'Audit Log Integrity', framework: 'HIPAA', category: 'Audit', owner: 'Platform Team', lastAssessed: '2026-05-15T00:00:00Z', status: 'partial' },
  { id: 'cc4', controlCode: 'BC-01', name: 'Business Continuity Plan', framework: 'ISO 27001', category: 'Continuity', owner: 'Ops Lead', lastAssessed: '2026-04-10T00:00:00Z', status: 'non-compliant' },
  { id: 'cc5', controlCode: 'EN-04', name: 'Encryption at Rest', framework: 'DPDP', category: 'Encryption', owner: 'Infra Team', lastAssessed: '2026-06-05T00:00:00Z', status: 'compliant' },
];

export const mockComplianceEvidence: ComplianceEvidence[] = [
  { id: 'ce1', evidenceCode: 'EVD-2026-118', controlName: 'Access Control Policy', type: 'Policy Document', collectedAt: '2026-05-20T00:00:00Z', collectedBy: 'Compliance Officer', expiresAt: '2027-05-20T00:00:00Z', status: 'valid' },
  { id: 'ce2', evidenceCode: 'EVD-2026-115', controlName: 'Audit Log Integrity', type: 'System Report', collectedAt: '2026-06-01T00:00:00Z', collectedBy: 'Platform Team', status: 'pending-review' },
  { id: 'ce3', evidenceCode: 'EVD-2026-110', controlName: 'Encryption at Rest', type: 'Pen Test Report', collectedAt: '2026-05-15T00:00:00Z', collectedBy: 'Security Ops', expiresAt: '2026-11-15T00:00:00Z', status: 'valid' },
  { id: 'ce4', evidenceCode: 'EVD-2026-098', controlName: 'Business Continuity Plan', type: 'BCP Document', collectedAt: '2025-04-10T00:00:00Z', collectedBy: 'Ops Lead', expiresAt: '2026-04-10T00:00:00Z', status: 'expired' },
  { id: 'ce5', evidenceCode: 'EVD-2026-122', controlName: 'Data Retention Limits', type: 'Configuration Export', collectedAt: '2026-06-05T00:00:00Z', collectedBy: 'DMS Admin', status: 'valid' },
];

export const mockComplianceRisks: ComplianceRisk[] = [
  { id: 'cr1', riskCode: 'RISK-041', title: 'Incomplete BCP documentation', category: 'Operational', likelihood: 'medium', impact: 'high', owner: 'Ops Lead', status: 'mitigating' },
  { id: 'cr2', riskCode: 'RISK-038', title: 'Third-party vendor SOC 2 gap', category: 'Vendor', likelihood: 'low', impact: 'high', owner: 'Procurement', status: 'open' },
  { id: 'cr3', riskCode: 'RISK-035', title: 'Audit log retention below 7 years', category: 'Regulatory', likelihood: 'medium', impact: 'medium', owner: 'Platform Team', status: 'open' },
  { id: 'cr4', riskCode: 'RISK-032', title: 'Missing consent workflow for UAE tenants', category: 'Privacy', likelihood: 'high', impact: 'high', owner: 'Product Team', status: 'mitigating' },
  { id: 'cr5', riskCode: 'RISK-028', title: 'Legacy TLS 1.1 on device gateway', category: 'Technical', likelihood: 'low', impact: 'medium', owner: 'Infra Team', status: 'closed' },
];

export const mockCompliancePolicies: CompliancePolicy[] = [
  { id: 'pol1', policyCode: 'POL-SEC-001', title: 'Information Security Policy', version: '3.2', effectiveDate: '2026-01-01T00:00:00Z', owner: 'CISO', reviewDue: '2027-01-01T00:00:00Z', status: 'active' },
  { id: 'pol2', policyCode: 'POL-DP-002', title: 'Data Protection & Privacy Policy', version: '2.1', effectiveDate: '2025-08-15T00:00:00Z', owner: 'Compliance Officer', reviewDue: '2026-08-15T00:00:00Z', status: 'under-review' },
  { id: 'pol3', policyCode: 'POL-IR-003', title: 'Incident Response Policy', version: '1.5', effectiveDate: '2025-11-01T00:00:00Z', owner: 'Security Ops', reviewDue: '2026-11-01T00:00:00Z', status: 'active' },
  { id: 'pol4', policyCode: 'POL-BC-004', title: 'Business Continuity Policy', version: '1.0', effectiveDate: '2026-03-01T00:00:00Z', owner: 'Ops Lead', reviewDue: '2027-03-01T00:00:00Z', status: 'draft' },
  { id: 'pol5', policyCode: 'POL-AC-005', title: 'Acceptable Use Policy', version: '2.0', effectiveDate: '2024-06-01T00:00:00Z', owner: 'HR', reviewDue: '2026-06-01T00:00:00Z', status: 'active' },
];
