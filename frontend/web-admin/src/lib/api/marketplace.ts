import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockMarketplaceCamps,
  mockMarketplaceDashboardStats,
  mockMarketplaceListings,
  mockMarketplaceOrders,
  mockMarketplacePartners,
  mockWellnessPackages,
} from '@/lib/mock-data/marketplace';
import type {
  MarketplaceCamp,
  MarketplaceDashboardStats,
  MarketplaceListing,
  MarketplaceOrder,
  MarketplacePartner,
  WellnessPackage,
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

const BASE = '/api/v1/marketplace';

export const marketplaceApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<MarketplaceDashboardStats>(`${BASE}/stats`),
      mockMarketplaceDashboardStats,
    ),

  listListings: () =>
    withMockFallback(
      () => api.get<MarketplaceListing[]>(`${BASE}/listings`),
      mockMarketplaceListings,
    ),

  listPartners: () =>
    withMockFallback(
      () => api.get<MarketplacePartner[]>(`${BASE}/partners`),
      mockMarketplacePartners,
    ),

  listOrders: () =>
    withMockFallback(
      () => api.get<MarketplaceOrder[]>(`${BASE}/orders`),
      mockMarketplaceOrders,
    ),

  listWellnessPackages: () =>
    withMockFallback(
      () => api.get<WellnessPackage[]>(`${BASE}/wellness`),
      mockWellnessPackages,
    ),

  listCamps: () =>
    withMockFallback(
      () => api.get<MarketplaceCamp[]>(`${BASE}/camps`),
      mockMarketplaceCamps,
    ),
};
