import type {
  PartnerContract,
  PartnerDashboardSummary,
  PartnerQuotation,
  PartnerRevenue,
  PartnerSubscription,
  PartnerSupportTicket,
  PartnerUser,
} from '@/types';

export const mockPartnerUser: PartnerUser = {
  id: 'ptr-user-1',
  partnerCode: 'PTR-001',
  name: 'Vikram Desai',
  email: 'vikram@diagnotech.in',
  company: 'DiagnoTech Solutions',
  region: 'South India',
  type: 'reseller',
};

export const mockPartnerDashboardSummary: PartnerDashboardSummary = {
  activeSubscriptions: 8,
  pendingQuotations: 3,
  activeContracts: 6,
  monthlyRevenue: 842000,
  revenueShare: 15,
};

export const mockPartnerSubscriptions: PartnerSubscription[] = [
  { id: 'ps1', subscriptionCode: 'SUB-P-042', tenantName: 'Apollo Diagnostics Pune', plan: 'Enterprise', mrr: 149999, startDate: '2025-06-01T00:00:00Z', status: 'active' },
  { id: 'ps2', subscriptionCode: 'SUB-P-038', tenantName: 'MedLife Labs Chennai', plan: 'Professional', mrr: 49999, startDate: '2026-01-15T00:00:00Z', status: 'active' },
  { id: 'ps3', subscriptionCode: 'SUB-P-035', tenantName: 'HealthFirst Mumbai', plan: 'Starter', mrr: 14999, startDate: '2026-03-01T00:00:00Z', status: 'trial' },
  { id: 'ps4', subscriptionCode: 'SUB-P-030', tenantName: 'CarePlus Bangalore', plan: 'Enterprise', mrr: 149999, startDate: '2024-08-01T00:00:00Z', status: 'active' },
  { id: 'ps5', subscriptionCode: 'SUB-P-028', tenantName: 'Sunrise Diagnostics Jaipur', plan: 'Professional', mrr: 49999, startDate: '2026-02-01T00:00:00Z', status: 'active' },
];

export const mockPartnerQuotations: PartnerQuotation[] = [
  { id: 'pq1', quotationCode: 'QUO-P-088', prospectName: 'Wellness Path Delhi', plan: 'Professional', amount: 599988, validUntil: '2026-06-30T00:00:00Z', status: 'sent' },
  { id: 'pq2', quotationCode: 'QUO-P-085', prospectName: 'Metro Health Kolkata', plan: 'Enterprise', amount: 1799988, validUntil: '2026-07-15T00:00:00Z', status: 'draft' },
  { id: 'pq3', quotationCode: 'QUO-P-082', prospectName: 'CityCare Ahmedabad', plan: 'Starter', amount: 179988, validUntil: '2026-06-20T00:00:00Z', status: 'accepted' },
];

export const mockPartnerContracts: PartnerContract[] = [
  { id: 'pc1', contractCode: 'CTR-P-012', tenantName: 'Apollo Diagnostics Pune', plan: 'Enterprise', startDate: '2025-06-01T00:00:00Z', endDate: '2026-06-01T00:00:00Z', value: 1799988, status: 'active' },
  { id: 'pc2', contractCode: 'CTR-P-010', tenantName: 'MedLife Labs Chennai', plan: 'Professional', startDate: '2026-01-15T00:00:00Z', endDate: '2027-01-15T00:00:00Z', value: 599988, status: 'active' },
  { id: 'pc3', contractCode: 'CTR-P-008', tenantName: 'CarePlus Bangalore', plan: 'Enterprise', startDate: '2024-08-01T00:00:00Z', endDate: '2026-08-01T00:00:00Z', value: 3599976, status: 'active' },
  { id: 'pc4', contractCode: 'CTR-P-006', tenantName: 'DiagnoTech Legacy Client', plan: 'Professional', startDate: '2023-03-01T00:00:00Z', endDate: '2025-03-01T00:00:00Z', value: 1199976, status: 'expired' },
];

export const mockPartnerRevenue: PartnerRevenue[] = [
  { id: 'pr1', period: 'Jan 2026', grossRevenue: 5200000, revenueShare: 15, partnerEarnings: 780000, subscriptions: 6 },
  { id: 'pr2', period: 'Feb 2026', grossRevenue: 5450000, revenueShare: 15, partnerEarnings: 817500, subscriptions: 7 },
  { id: 'pr3', period: 'Mar 2026', grossRevenue: 5680000, revenueShare: 15, partnerEarnings: 852000, subscriptions: 7 },
  { id: 'pr4', period: 'Apr 2026', grossRevenue: 5920000, revenueShare: 15, partnerEarnings: 888000, subscriptions: 8 },
  { id: 'pr5', period: 'May 2026', grossRevenue: 6150000, revenueShare: 15, partnerEarnings: 922500, subscriptions: 8 },
  { id: 'pr6', period: 'Jun 2026 (MTD)', grossRevenue: 5613000, revenueShare: 15, partnerEarnings: 841950, subscriptions: 8 },
];

export const mockPartnerSupportTickets: PartnerSupportTicket[] = [
  { id: 'pst1', ticketCode: 'PTR-2026-042', subject: 'Co-branded invoice template request', priority: 'medium', createdAt: '2026-06-06T10:00:00Z', status: 'in-progress' },
  { id: 'pst2', ticketCode: 'PTR-2026-038', subject: 'API rate limit increase for integration', priority: 'high', createdAt: '2026-06-04T14:30:00Z', status: 'open' },
  { id: 'pst3', ticketCode: 'PTR-2026-035', subject: 'Partner portal revenue report discrepancy', priority: 'urgent', createdAt: '2026-06-02T09:15:00Z', status: 'waiting' },
  { id: 'pst4', ticketCode: 'PTR-2026-030', subject: 'New tenant onboarding assistance', priority: 'low', createdAt: '2026-05-28T16:00:00Z', status: 'resolved' },
];
