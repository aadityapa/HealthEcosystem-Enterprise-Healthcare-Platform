import type {
  CustomerSuccessDashboardStats,
  KnowledgeArticle,
  MigrationRecord,
  OnboardingRecord,
  SupportTicket,
  TrainingSession,
} from '@/types';

export const mockCustomerSuccessDashboardStats: CustomerSuccessDashboardStats = {
  activeOnboardings: 4,
  migrationsInProgress: 2,
  trainingSessions: 6,
  openTickets: 11,
  onboardingsTrend: 33.3,
  migrationsTrend: 0,
  trainingTrend: 20.0,
  ticketsTrend: -15.4,
};

export const mockOnboardingRecords: OnboardingRecord[] = [
  { id: 'ob1', tenantName: 'Apollo Diagnostics Pune', plan: 'Enterprise', startDate: '2026-05-15T00:00:00Z', goLiveDate: '2026-07-01T00:00:00Z', progress: 72, csm: 'Priya Sharma', status: 'in-progress' },
  { id: 'ob2', tenantName: 'MedLife Labs Chennai', plan: 'Professional', startDate: '2026-06-01T00:00:00Z', goLiveDate: '2026-08-15T00:00:00Z', progress: 35, csm: 'Rahul Mehta', status: 'in-progress' },
  { id: 'ob3', tenantName: 'HealthFirst Mumbai', plan: 'Starter', startDate: '2026-06-05T00:00:00Z', goLiveDate: '2026-06-28T00:00:00Z', progress: 58, csm: 'Anita Desai', status: 'blocked' },
  { id: 'ob4', tenantName: 'CarePlus Bangalore', plan: 'Enterprise', startDate: '2026-04-01T00:00:00Z', goLiveDate: '2026-05-30T00:00:00Z', progress: 100, csm: 'Priya Sharma', status: 'completed' },
  { id: 'ob5', tenantName: 'Wellness Path Delhi', plan: 'Professional', startDate: '2026-06-08T00:00:00Z', goLiveDate: '2026-09-01T00:00:00Z', progress: 10, csm: 'Rahul Mehta', status: 'not-started' },
];

export const mockMigrationRecords: MigrationRecord[] = [
  { id: 'mg1', migrationCode: 'MIG-2026-012', tenantName: 'Apollo Diagnostics Pune', sourceSystem: 'Legacy LIMS v2', recordsTotal: 245000, recordsMigrated: 198000, startedAt: '2026-05-20T00:00:00Z', status: 'in-progress' },
  { id: 'mg2', migrationCode: 'MIG-2026-010', tenantName: 'MedLife Labs Chennai', sourceSystem: 'Excel + Custom DB', recordsTotal: 82000, recordsMigrated: 45000, startedAt: '2026-06-02T00:00:00Z', status: 'validating' },
  { id: 'mg3', migrationCode: 'MIG-2026-008', tenantName: 'CarePlus Bangalore', sourceSystem: 'Competitor SaaS', recordsTotal: 156000, recordsMigrated: 156000, startedAt: '2026-04-10T00:00:00Z', status: 'completed' },
  { id: 'mg4', migrationCode: 'MIG-2026-015', tenantName: 'HealthFirst Mumbai', sourceSystem: 'Paper + Spreadsheets', recordsTotal: 12000, recordsMigrated: 0, startedAt: '2026-06-08T00:00:00Z', status: 'planning' },
];

export const mockTrainingSessions: TrainingSession[] = [
  { id: 'tr1', sessionCode: 'TRN-2026-048', title: 'LIMS Order Workflow', audience: 'Lab Technicians', trainer: 'Anita Desai', scheduledAt: '2026-06-10T10:00:00Z', attendees: 12, status: 'scheduled' },
  { id: 'tr2', sessionCode: 'TRN-2026-045', title: 'Billing & GST Module', audience: 'Billing Team', trainer: 'Rahul Mehta', scheduledAt: '2026-06-08T14:00:00Z', attendees: 8, status: 'in-progress' },
  { id: 'tr3', sessionCode: 'TRN-2026-042', title: 'Device Integration Setup', audience: 'IT Admins', trainer: 'Priya Sharma', scheduledAt: '2026-06-05T11:00:00Z', attendees: 5, status: 'completed' },
  { id: 'tr4', sessionCode: 'TRN-2026-050', title: 'Admin Portal Overview', audience: 'Branch Managers', trainer: 'Anita Desai', scheduledAt: '2026-06-12T09:00:00Z', attendees: 15, status: 'scheduled' },
  { id: 'tr5', sessionCode: 'TRN-2026-038', title: 'QC & CAPA Module', audience: 'QC Officers', trainer: 'Rahul Mehta', scheduledAt: '2026-06-03T15:00:00Z', attendees: 6, status: 'completed' },
];

export const mockKnowledgeArticles: KnowledgeArticle[] = [
  { id: 'ka1', articleCode: 'KB-00142', title: 'How to configure ASTM device adapters', category: 'Devices', views: 1240, updatedAt: '2026-06-01T00:00:00Z', author: 'Platform Team', status: 'published' },
  { id: 'ka2', articleCode: 'KB-00138', title: 'GST invoice generation workflow', category: 'Billing', views: 890, updatedAt: '2026-05-28T00:00:00Z', author: 'Billing Team', status: 'published' },
  { id: 'ka3', articleCode: 'KB-00135', title: 'Patient registration best practices', category: 'Patients', views: 2100, updatedAt: '2026-05-20T00:00:00Z', author: 'CS Team', status: 'published' },
  { id: 'ka4', articleCode: 'KB-00150', title: 'ABDM consent artefact setup', category: 'ABDM', views: 340, updatedAt: '2026-06-05T00:00:00Z', author: 'Integration Team', status: 'draft' },
  { id: 'ka5', articleCode: 'KB-00128', title: 'Multi-branch rate card configuration', category: 'Master Data', views: 560, updatedAt: '2026-04-15T00:00:00Z', author: 'CS Team', status: 'published' },
];

export const mockSupportTickets: SupportTicket[] = [
  { id: 'tk1', ticketCode: 'CS-2026-1842', tenantName: 'Apollo Diagnostics Pune', subject: 'Device message queue backlog', priority: 'high', createdAt: '2026-06-07T08:30:00Z', assignee: 'L2 Support', status: 'in-progress' },
  { id: 'tk2', ticketCode: 'CS-2026-1838', tenantName: 'HealthFirst Mumbai', subject: 'Unable to generate monthly GST report', priority: 'medium', createdAt: '2026-06-06T14:15:00Z', assignee: 'Billing Support', status: 'waiting' },
  { id: 'tk3', ticketCode: 'CS-2026-1835', tenantName: 'MedLife Labs Chennai', subject: 'Onboarding data import validation errors', priority: 'urgent', createdAt: '2026-06-06T10:00:00Z', assignee: 'Priya Sharma', status: 'open' },
  { id: 'tk4', ticketCode: 'CS-2026-1820', tenantName: 'CarePlus Bangalore', subject: 'Custom report template request', priority: 'low', createdAt: '2026-06-04T16:45:00Z', assignee: 'CS Team', status: 'resolved' },
  { id: 'tk5', ticketCode: 'CS-2026-1815', tenantName: 'Wellness Path Delhi', subject: 'SSO integration with Azure AD', priority: 'medium', createdAt: '2026-06-03T11:20:00Z', assignee: 'Integration Team', status: 'open' },
];
