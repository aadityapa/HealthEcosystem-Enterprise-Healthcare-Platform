import { api } from '@/lib/api/client';
import { fetchWithDelay } from '@/lib/mock-data';
import {
  mockCountryLocales,
  mockI18nDashboardStats,
  mockTenantLocaleOverrides,
  mockTranslationEntries,
} from '@/lib/mock-data/i18n';
import type {
  CountryLocale,
  I18nDashboardStats,
  TenantLocaleOverride,
  TranslationEntry,
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

const BASE = '/api/v1/i18n';

export const i18nApi = {
  getDashboardStats: () =>
    withMockFallback(
      () => api.get<I18nDashboardStats>(`${BASE}/stats`),
      mockI18nDashboardStats,
    ),

  listCountries: () =>
    withMockFallback(
      () => api.get<CountryLocale[]>(`${BASE}/countries`),
      mockCountryLocales,
    ),

  listTranslations: () =>
    withMockFallback(
      () => api.get<TranslationEntry[]>(`${BASE}/translations`),
      mockTranslationEntries,
    ),

  listTenantLocales: () =>
    withMockFallback(
      () => api.get<TenantLocaleOverride[]>(`${BASE}/tenant-locale`),
      mockTenantLocaleOverrides,
    ),
};
