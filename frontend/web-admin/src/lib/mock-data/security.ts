import type {
  PentestReport,
  SecurityCertificate,
  SecurityDashboardStats,
  SecurityIncident,
  SecurityThreat,
  SecurityVulnerability,
} from '@/types';

export const mockSecurityDashboardStats: SecurityDashboardStats = {
  openIncidents: 3,
  activeThreats: 7,
  openVulnerabilities: 12,
  expiringCertificates: 2,
  incidentsTrend: -25,
  threatsTrend: 14.3,
  vulnerabilitiesTrend: -8.2,
  certificatesTrend: 0,
};

export const mockSecurityIncidents: SecurityIncident[] = [
  { id: 'si1', incidentCode: 'INC-2026-041', title: 'Suspicious login spike from APAC region', severity: 'high', category: 'Authentication', reportedAt: '2026-06-07T14:22:00Z', assignedTo: 'Security Ops', status: 'investigating' },
  { id: 'si2', incidentCode: 'INC-2026-038', title: 'Unauthorized API key usage detected', severity: 'critical', category: 'API Security', reportedAt: '2026-06-05T09:15:00Z', assignedTo: 'Platform Security', status: 'contained' },
  { id: 'si3', incidentCode: 'INC-2026-035', title: 'Phishing attempt targeting lab admins', severity: 'medium', category: 'Social Engineering', reportedAt: '2026-06-03T11:40:00Z', assignedTo: 'SOC Team', status: 'resolved' },
  { id: 'si4', incidentCode: 'INC-2026-032', title: 'DDoS mitigation triggered on edge gateway', severity: 'high', category: 'Network', reportedAt: '2026-06-01T18:05:00Z', assignedTo: 'Infra Security', status: 'resolved' },
  { id: 'si5', incidentCode: 'INC-2026-029', title: 'Misconfigured S3 bucket policy flagged', severity: 'medium', category: 'Cloud Security', reportedAt: '2026-05-28T08:30:00Z', assignedTo: 'Cloud Sec', status: 'open' },
];

export const mockSecurityThreats: SecurityThreat[] = [
  { id: 'st1', threatCode: 'THR-8821', source: 'CrowdStrike Intel', type: 'Brute Force', target: 'auth-service', detectedAt: '2026-06-08T06:12:00Z', riskScore: 78, status: 'active' },
  { id: 'st2', threatCode: 'THR-8819', source: 'WAF Logs', type: 'SQL Injection', target: 'lims-api', detectedAt: '2026-06-07T22:45:00Z', riskScore: 92, status: 'active' },
  { id: 'st3', threatCode: 'THR-8815', source: 'SIEM', type: 'Lateral Movement', target: 'billing-service', detectedAt: '2026-06-07T15:30:00Z', riskScore: 65, status: 'mitigated' },
  { id: 'st4', threatCode: 'THR-8810', source: 'IDS', type: 'Port Scan', target: 'device-gateway', detectedAt: '2026-06-06T10:20:00Z', riskScore: 42, status: 'dismissed' },
  { id: 'st5', threatCode: 'THR-8805', source: 'Threat Feed', type: 'Malware C2', target: 'web-admin', detectedAt: '2026-06-05T19:08:00Z', riskScore: 88, status: 'active' },
];

export const mockSecurityVulnerabilities: SecurityVulnerability[] = [
  { id: 'sv1', cveId: 'CVE-2026-1234', component: 'nginx:1.24', severity: 'high', discoveredAt: '2026-06-01T00:00:00Z', patchAvailable: true, status: 'in-progress' },
  { id: 'sv2', cveId: 'CVE-2026-0987', component: 'node:20.11', severity: 'critical', discoveredAt: '2026-05-28T00:00:00Z', patchAvailable: true, status: 'open' },
  { id: 'sv3', cveId: 'CVE-2025-8842', component: 'postgresql:16.2', severity: 'medium', discoveredAt: '2026-05-20T00:00:00Z', patchAvailable: true, status: 'patched' },
  { id: 'sv4', cveId: 'CVE-2025-7721', component: 'redis:7.2', severity: 'low', discoveredAt: '2026-05-15T00:00:00Z', patchAvailable: false, status: 'accepted' },
  { id: 'sv5', cveId: 'CVE-2026-0456', component: 'next.js:15.1', severity: 'high', discoveredAt: '2026-06-04T00:00:00Z', patchAvailable: true, status: 'open' },
];

export const mockPentestReports: PentestReport[] = [
  { id: 'pt1', reportCode: 'PEN-2026-Q2', vendor: 'SecurePath Labs', scope: 'Full platform (API + Web)', conductedAt: '2026-05-15T00:00:00Z', findings: 18, criticalFindings: 2, status: 'remediation' },
  { id: 'pt2', reportCode: 'PEN-2026-Q1', vendor: 'CyberShield India', scope: 'Patient mobile app', conductedAt: '2026-02-10T00:00:00Z', findings: 12, criticalFindings: 0, status: 'completed' },
  { id: 'pt3', reportCode: 'PEN-2025-Q4', vendor: 'SecurePath Labs', scope: 'Device integration layer', conductedAt: '2025-11-20T00:00:00Z', findings: 8, criticalFindings: 1, status: 'completed' },
  { id: 'pt4', reportCode: 'PEN-2026-Q3', vendor: 'TBD', scope: 'Partner portal + APIs', conductedAt: '2026-07-01T00:00:00Z', findings: 0, criticalFindings: 0, status: 'scheduled' },
];

export const mockSecurityCertificates: SecurityCertificate[] = [
  { id: 'sc1', domain: 'api.healthecosystem.io', issuer: "Let's Encrypt", issuedAt: '2026-03-10T00:00:00Z', expiresAt: '2026-09-10T00:00:00Z', daysRemaining: 94, status: 'valid' },
  { id: 'sc2', domain: 'admin.healthecosystem.io', issuer: 'DigiCert', issuedAt: '2025-12-01T00:00:00Z', expiresAt: '2026-06-15T00:00:00Z', daysRemaining: 7, status: 'expiring' },
  { id: 'sc3', domain: 'portal.healthecosystem.io', issuer: 'DigiCert', issuedAt: '2025-06-01T00:00:00Z', expiresAt: '2026-06-01T00:00:00Z', daysRemaining: -7, status: 'expired' },
  { id: 'sc4', domain: 'devices.healthecosystem.io', issuer: "Let's Encrypt", issuedAt: '2026-05-01T00:00:00Z', expiresAt: '2026-11-01T00:00:00Z', daysRemaining: 146, status: 'valid' },
  { id: 'sc5', domain: 'partner.healthecosystem.io', issuer: 'GlobalSign', issuedAt: '2026-01-15T00:00:00Z', expiresAt: '2027-01-15T00:00:00Z', daysRemaining: 221, status: 'valid' },
];
