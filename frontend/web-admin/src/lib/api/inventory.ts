import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockConsumables,
  mockExpiryAlerts,
  mockInventoryDashboardStats,
  mockKits,
  mockPurchaseOrders,
  mockReagents,
  mockStockTransfers,
  mockVendors,
} from '@/lib/mock-data/inventory';
import type {
  Consumable,
  ExpiryAlert,
  InventoryDashboardStats,
  Kit,
  PurchaseOrder,
  Reagent,
  StockTransfer,
  Vendor,
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

const BASE = '/api/v1/inventory';

export const inventoryApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<InventoryDashboardStats>(`${BASE}/stats`),
      mockInventoryDashboardStats,
    ),

  listReagents: () =>
    withMockFallback(() => api.get<Reagent[]>(`${BASE}/reagents`), mockReagents),

  listKits: () =>
    withMockFallback(() => api.get<Kit[]>(`${BASE}/kits`), mockKits),

  listConsumables: () =>
    withMockFallback(() => api.get<Consumable[]>(`${BASE}/consumables`), mockConsumables),

  listVendors: () =>
    withMockFallback(() => api.get<Vendor[]>(`${BASE}/vendors`), mockVendors),

  listPurchaseOrders: () =>
    withMockFallback(() => api.get<PurchaseOrder[]>(`${BASE}/purchase-orders`), mockPurchaseOrders),

  listTransfers: () =>
    withMockFallback(() => api.get<StockTransfer[]>(`${BASE}/transfers`), mockStockTransfers),

  listExpiryAlerts: () =>
    withMockFallback(() => api.get<ExpiryAlert[]>(`${BASE}/expiry`), mockExpiryAlerts),
};
