import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  getBillingInvoiceById,
  mockBillingDashboardStats,
  mockBillingInvoices,
  mockCorporateClients,
  mockCorporateStatements,
  mockFranchiseSettlements,
  mockGstReportEntries,
  mockGstReportSummary,
  mockInsuranceClaims,
  mockOutstanding,
  mockPaymentMethodBreakdown,
  mockPayments,
} from '@/lib/mock-data/billing';
import type {
  BillingDashboardStats,
  BillingInvoice,
  CorporateClient,
  CorporateStatement,
  FranchiseSettlement,
  GstReportEntry,
  GstReportSummary,
  InsuranceClaim,
  OutstandingRecord,
  PaymentCollection,
  PaymentMethodBreakdown,
} from '@/types';

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false';

async function withMockFallback<T>(apiCall: () => Promise<T>, mockData: T, delay = 600): Promise<T> {
  if (USE_MOCK) return fetchWithDelay(mockData, delay);
  try {
    return await apiCall();
  } catch {
    return fetchWithDelay(mockData, delay);
  }
}

const BASE = '/api/v1/billing';

export const billingApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<BillingDashboardStats>(`${BASE}/stats`),
      mockBillingDashboardStats,
    ),

  getPaymentMethodBreakdown: () =>
    withMockFallback(
      () => api.get<PaymentMethodBreakdown[]>(`${BASE}/payment-methods`),
      mockPaymentMethodBreakdown,
    ),

  listInvoices: () =>
    withMockFallback(() => api.get<BillingInvoice[]>(`${BASE}/invoices`), mockBillingInvoices),

  getInvoice: (id: string) =>
    withMockFallback(
      () => api.get<BillingInvoice>(`${BASE}/invoices/${id}`),
      getBillingInvoiceById(id) ?? mockBillingInvoices[0],
    ),

  voidInvoice: (id: string) =>
    withMockFallback(
      () => api.post<{ success: boolean }>(`${BASE}/invoices/${id}/void`),
      { success: true },
      500,
    ),

  listPayments: () =>
    withMockFallback(() => api.get<PaymentCollection[]>(`${BASE}/payments`), mockPayments),

  listCorporateClients: () =>
    withMockFallback(
      () => api.get<CorporateClient[]>(`${BASE}/corporate`),
      mockCorporateClients,
    ),

  listCorporateStatements: () =>
    withMockFallback(
      () => api.get<CorporateStatement[]>(`${BASE}/corporate/statements`),
      mockCorporateStatements,
    ),

  listInsuranceClaims: () =>
    withMockFallback(
      () => api.get<InsuranceClaim[]>(`${BASE}/insurance`),
      mockInsuranceClaims,
    ),

  listFranchiseSettlements: () =>
    withMockFallback(
      () => api.get<FranchiseSettlement[]>(`${BASE}/franchise`),
      mockFranchiseSettlements,
    ),

  getGstReport: (period?: string) =>
    withMockFallback(
      () => api.get<{ summary: GstReportSummary; entries: GstReportEntry[] }>(`${BASE}/gst`, { params: { period } }),
      { summary: { ...mockGstReportSummary, period: period ?? mockGstReportSummary.period }, entries: mockGstReportEntries },
    ),

  listOutstanding: () =>
    withMockFallback(
      () => api.get<OutstandingRecord[]>(`${BASE}/outstanding`),
      mockOutstanding,
    ),
};
