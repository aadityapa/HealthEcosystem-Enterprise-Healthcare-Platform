import type { ComplianceFramework } from '@health/db';

export interface ComplianceControlSeed {
  controlCode: string;
  title: string;
  description: string;
  category: string;
}

export interface CompliancePackSeed {
  framework: ComplianceFramework;
  name: string;
  description: string;
  controls: ComplianceControlSeed[];
}

export const COMPLIANCE_PACK_SEEDS: CompliancePackSeed[] = [
  {
    framework: 'HIPAA',
    name: 'HIPAA Security & Privacy',
    description: 'US healthcare data protection requirements',
    controls: [
      { controlCode: 'HIPAA-164.308', title: 'Administrative Safeguards', description: 'Security management process', category: 'Administrative' },
      { controlCode: 'HIPAA-164.310', title: 'Physical Safeguards', description: 'Facility access controls', category: 'Physical' },
      { controlCode: 'HIPAA-164.312', title: 'Technical Safeguards', description: 'Access control and audit controls', category: 'Technical' },
    ],
  },
  {
    framework: 'GDPR',
    name: 'General Data Protection Regulation',
    description: 'EU personal data protection framework',
    controls: [
      { controlCode: 'GDPR-Art5', title: 'Principles of Processing', description: 'Lawfulness, fairness, transparency', category: 'Data Processing' },
      { controlCode: 'GDPR-Art25', title: 'Data Protection by Design', description: 'Privacy by design and default', category: 'Engineering' },
      { controlCode: 'GDPR-Art32', title: 'Security of Processing', description: 'Appropriate technical measures', category: 'Security' },
    ],
  },
  {
    framework: 'DPDP',
    name: 'Digital Personal Data Protection Act',
    description: 'India digital personal data protection',
    controls: [
      { controlCode: 'DPDP-Sec4', title: 'Lawful Processing', description: 'Consent and legitimate use', category: 'Consent' },
      { controlCode: 'DPDP-Sec8', title: 'Data Principal Rights', description: 'Access, correction, erasure rights', category: 'Rights' },
      { controlCode: 'DPDP-Sec9', title: 'Security Safeguards', description: 'Reasonable security safeguards', category: 'Security' },
    ],
  },
  {
    framework: 'ISO_27001',
    name: 'ISO/IEC 27001',
    description: 'Information security management system',
    controls: [
      { controlCode: 'ISO-A.5', title: 'Organizational Controls', description: 'Policies for information security', category: 'Governance' },
      { controlCode: 'ISO-A.8', title: 'Technological Controls', description: 'Secure development and operations', category: 'Technology' },
      { controlCode: 'ISO-A.12', title: 'Operations Security', description: 'Operational procedures and responsibilities', category: 'Operations' },
    ],
  },
  {
    framework: 'SOC2',
    name: 'SOC 2 Type II',
    description: 'Service organization trust criteria',
    controls: [
      { controlCode: 'SOC2-CC6', title: 'Logical Access', description: 'Logical access security software', category: 'Access' },
      { controlCode: 'SOC2-CC7', title: 'System Operations', description: 'Detection and monitoring activities', category: 'Monitoring' },
      { controlCode: 'SOC2-CC8', title: 'Change Management', description: 'Authorized changes to infrastructure', category: 'Change' },
    ],
  },
  {
    framework: 'NABL',
    name: 'NABL Accreditation',
    description: 'National Accreditation Board for Testing and Calibration Laboratories',
    controls: [
      { controlCode: 'NABL-4.1', title: 'Impartiality', description: 'Laboratory impartiality policies', category: 'Governance' },
      { controlCode: 'NABL-5.8', title: 'Technical Records', description: 'Accurate and complete records', category: 'Records' },
      { controlCode: 'NABL-7.7', title: 'Result Validity', description: 'Ensuring validity of results', category: 'Quality' },
    ],
  },
  {
    framework: 'CAP',
    name: 'CAP Laboratory Accreditation',
    description: 'College of American Pathologists standards',
    controls: [
      { controlCode: 'CAP-GEN.41100', title: 'Quality Management', description: 'Quality management system', category: 'Quality' },
      { controlCode: 'CAP-GEN.41300', title: 'Document Control', description: 'Controlled document management', category: 'Documentation' },
      { controlCode: 'CAP-GEN.41600', title: 'Proficiency Testing', description: 'External quality assessment', category: 'Testing' },
    ],
  },
  {
    framework: 'ABDM',
    name: 'Ayushman Bharat Digital Mission',
    description: 'India national digital health ecosystem standards',
    controls: [
      { controlCode: 'ABDM-HIP', title: 'Health Information Provider', description: 'HIP registration and consent', category: 'Interop' },
      { controlCode: 'ABDM-HIU', title: 'Health Information User', description: 'Authorized data consumption', category: 'Interop' },
      { controlCode: 'ABDM-CONSENT', title: 'Consent Management', description: 'Patient consent artefact management', category: 'Consent' },
    ],
  },
];
