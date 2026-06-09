import type {
  CommercialDashboardStats,
  CommercialPartner,
  CommercialPlan,
  CommercialQuotation,
  CommercialRevenue,
  CommercialSubscription,
} from '@/types';

export const mockCommercialDashboardStats: CommercialDashboardStats = {
  activePlans: 4,
  activeSubscriptions: 28,
  pendingQuotations: 7,
  partnerRevenue: 8420000,
  plansTrend: 0,
  subscriptionsTrend: 16.7,
  quotationsTrend: 40.0,
  revenueTrend: 12.4,
};

export const mockCommercialPlans: CommercialPlan[] = [
  { id: 'pl1', planCode: 'PLAN-STARTER', name: 'Starter', tier: 'starter', monthlyPrice: 14999, annualPrice: 149990, features: '1 branch, 5 users, core LIMS', status: 'active' },
  { id: 'pl2', planCode: 'PLAN-PRO', name: 'Professional', tier: 'professional', monthlyPrice: 49999, annualPrice: 499990, features: '5 branches, 25 users, LIMS + Billing + CRM', status: 'active' },
  { id: 'pl3', planCode: 'PLAN-ENT', name: 'Enterprise', tier: 'enterprise', monthlyPrice: 149999, annualPrice: 1499990, features: 'Unlimited branches, full platform, SLA', status: 'active' },
  { id: 'pl4', planCode: 'PLAN-CUSTOM', name: 'Custom / White Label', tier: 'custom', monthlyPrice: 0, annualPrice: 0, features: 'Tailored modules, dedicated infra', status: 'active' },
  { id: 'pl5', planCode: 'PLAN-LEGACY', name: 'Legacy Basic', tier: 'starter', monthlyPrice: 9999, annualPrice: 99990, features: 'Deprecated — LIMS only', status: 'deprecated' },
];

export const mockCommercialSubscriptions: CommercialSubscription[] = [
  { id: 'sub1', subscriptionCode: 'SUB-2026-042', tenantName: 'Apollo Diagnostics Pune', plan: 'Enterprise', mrr: 149999, startDate: '2025-06-01T00:00:00Z', renewalDate: '2026-06-01T00:00:00Z', status: 'active' },
  { id: 'sub2', subscriptionCode: 'SUB-2026-038', tenantName: 'MedLife Labs Chennai', plan: 'Professional', mrr: 49999, startDate: '2026-01-15T00:00:00Z', renewalDate: '2027-01-15T00:00:00Z', status: 'active' },
  { id: 'sub3', subscriptionCode: 'SUB-2026-035', tenantName: 'HealthFirst Mumbai', plan: 'Starter', mrr: 14999, startDate: '2026-03-01T00:00:00Z', renewalDate: '2026-09-01T00:00:00Z', status: 'trial' },
  { id: 'sub4', subscriptionCode: 'SUB-2025-120', tenantName: 'CarePlus Bangalore', plan: 'Enterprise', mrr: 149999, startDate: '2024-08-01T00:00:00Z', renewalDate: '2026-08-01T00:00:00Z', status: 'active' },
  { id: 'sub5', subscriptionCode: 'SUB-2025-098', tenantName: 'DiagnoTech Hyderabad', plan: 'Professional', mrr: 49999, startDate: '2025-02-01T00:00:00Z', renewalDate: '2026-02-01T00:00:00Z', status: 'past-due' },
];

export const mockCommercialQuotations: CommercialQuotation[] = [
  { id: 'qt1', quotationCode: 'QUO-2026-088', prospectName: 'Wellness Path Delhi', plan: 'Professional', amount: 599988, validUntil: '2026-06-30T00:00:00Z', salesRep: 'Vikram Singh', status: 'sent' },
  { id: 'qt2', quotationCode: 'QUO-2026-085', prospectName: 'Metro Health Kolkata', plan: 'Enterprise', amount: 1799988, validUntil: '2026-07-15T00:00:00Z', salesRep: 'Neha Kapoor', status: 'draft' },
  { id: 'qt3', quotationCode: 'QUO-2026-082', prospectName: 'Sunrise Diagnostics Jaipur', plan: 'Starter', amount: 179988, validUntil: '2026-06-20T00:00:00Z', salesRep: 'Vikram Singh', status: 'accepted' },
  { id: 'qt4', quotationCode: 'QUO-2026-078', prospectName: 'Global Labs UAE', plan: 'Custom', amount: 3600000, validUntil: '2026-08-01T00:00:00Z', salesRep: 'Neha Kapoor', status: 'sent' },
  { id: 'qt5', quotationCode: 'QUO-2026-070', prospectName: 'CityCare Ahmedabad', plan: 'Professional', amount: 549990, validUntil: '2026-05-01T00:00:00Z', salesRep: 'Vikram Singh', status: 'expired' },
];

export const mockCommercialPartners: CommercialPartner[] = [
  { id: 'pt1', partnerCode: 'PTR-001', name: 'DiagnoTech Solutions', type: 'reseller', region: 'South India', activeSubscriptions: 8, revenueShare: 15, status: 'active' },
  { id: 'pt2', partnerCode: 'PTR-002', name: 'HealthBridge Referrals', type: 'referral', region: 'Pan India', activeSubscriptions: 12, revenueShare: 10, status: 'active' },
  { id: 'pt3', partnerCode: 'PTR-003', name: 'MedIntegrate Systems', type: 'integration', region: 'Global', activeSubscriptions: 4, revenueShare: 20, status: 'active' },
  { id: 'pt4', partnerCode: 'PTR-004', name: 'LabPro White Label', type: 'white-label', region: 'Middle East', activeSubscriptions: 2, revenueShare: 25, status: 'pending' },
  { id: 'pt5', partnerCode: 'PTR-005', name: 'CareNet Partners', type: 'reseller', region: 'North India', activeSubscriptions: 0, revenueShare: 15, status: 'suspended' },
];

export const mockCommercialRevenue: CommercialRevenue[] = [
  { id: 'rev1', period: 'Jan 2026', mrr: 2850000, arr: 34200000, newBusiness: 420000, churn: 85000, netRevenue: 3185000 },
  { id: 'rev2', period: 'Feb 2026', mrr: 2980000, arr: 35760000, newBusiness: 380000, churn: 65000, netRevenue: 3295000 },
  { id: 'rev3', period: 'Mar 2026', mrr: 3120000, arr: 37440000, newBusiness: 510000, churn: 72000, netRevenue: 3558000 },
  { id: 'rev4', period: 'Apr 2026', mrr: 3280000, arr: 39360000, newBusiness: 480000, churn: 58000, netRevenue: 3702000 },
  { id: 'rev5', period: 'May 2026', mrr: 3450000, arr: 41400000, newBusiness: 620000, churn: 45000, netRevenue: 4025000 },
  { id: 'rev6', period: 'Jun 2026 (MTD)', mrr: 3580000, arr: 42960000, newBusiness: 380000, churn: 38000, netRevenue: 3922000 },
];
