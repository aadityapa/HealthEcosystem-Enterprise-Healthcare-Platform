export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface PartnerUser {
  id: string;
  partnerCode: string;
  name: string;
  email: string;
  company: string;
  region: string;
  type: 'reseller' | 'referral' | 'integration' | 'white-label';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface PartnerDashboardSummary {
  activeSubscriptions: number;
  pendingQuotations: number;
  activeContracts: number;
  monthlyRevenue: number;
  revenueShare: number;
}

export interface PartnerSubscription {
  id: string;
  subscriptionCode: string;
  tenantName: string;
  plan: string;
  mrr: number;
  startDate: string;
  status: 'active' | 'trial' | 'past-due' | 'cancelled';
}

export interface PartnerQuotation {
  id: string;
  quotationCode: string;
  prospectName: string;
  plan: string;
  amount: number;
  validUntil: string;
  status: 'draft' | 'sent' | 'accepted' | 'expired' | 'rejected';
}

export interface PartnerContract {
  id: string;
  contractCode: string;
  tenantName: string;
  plan: string;
  startDate: string;
  endDate: string;
  value: number;
  status: 'active' | 'pending' | 'expired' | 'terminated';
}

export interface PartnerRevenue {
  id: string;
  period: string;
  grossRevenue: number;
  revenueShare: number;
  partnerEarnings: number;
  subscriptions: number;
}

export interface PartnerSupportTicket {
  id: string;
  ticketCode: string;
  subject: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: string;
  status: 'open' | 'in-progress' | 'waiting' | 'resolved' | 'closed';
}
