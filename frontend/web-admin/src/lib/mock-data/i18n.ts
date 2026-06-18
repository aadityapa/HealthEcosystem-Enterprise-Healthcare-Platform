import type {
  CountryLocale,
  I18nDashboardStats,
  TenantLocaleOverride,
  TranslationEntry,
} from '@/types';

export const mockI18nDashboardStats: I18nDashboardStats = {
  supportedLocales: 12,
  translationKeys: 4820,
  coveragePercent: 94.5,
  tenantOverrides: 8,
  localesTrend: 20.0,
  keysTrend: 5.8,
  coverageTrend: 2.3,
  overridesTrend: 14.3,
};

export const mockCountryLocales: CountryLocale[] = [
  { id: 'cl1', countryCode: 'IN', countryName: 'India', locale: 'en-IN', currency: 'INR', timezone: 'Asia/Kolkata', status: 'active' },
  { id: 'cl2', countryCode: 'IN', countryName: 'India', locale: 'hi-IN', currency: 'INR', timezone: 'Asia/Kolkata', status: 'active' },
  { id: 'cl3', countryCode: 'IN', countryName: 'India', locale: 'ta-IN', currency: 'INR', timezone: 'Asia/Kolkata', status: 'active' },
  { id: 'cl4', countryCode: 'AE', countryName: 'United Arab Emirates', locale: 'ar-AE', currency: 'AED', timezone: 'Asia/Dubai', status: 'active' },
  { id: 'cl5', countryCode: 'SG', countryName: 'Singapore', locale: 'en-SG', currency: 'SGD', timezone: 'Asia/Singapore', status: 'inactive' },
];

export const mockTranslationEntries: TranslationEntry[] = [
  { id: 'te1', key: 'dashboard.title', namespace: 'common', locale: 'en-IN', value: 'Dashboard', status: 'translated' },
  { id: 'te2', key: 'dashboard.title', namespace: 'common', locale: 'hi-IN', value: 'डैशबोर्ड', status: 'translated' },
  { id: 'te3', key: 'patient.register', namespace: 'patients', locale: 'en-IN', value: 'Register Patient', status: 'translated' },
  { id: 'te4', key: 'patient.register', namespace: 'patients', locale: 'hi-IN', value: 'रोगी पंजीकरण', status: 'review' },
  { id: 'te5', key: 'billing.invoice', namespace: 'billing', locale: 'ta-IN', value: '', status: 'pending' },
];

export const mockTenantLocaleOverrides: TenantLocaleOverride[] = [
  { id: 'tl1', tenantName: 'Mumbai Central Lab', defaultLocale: 'en-IN', fallbackLocale: 'en-IN', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-IN', rtlEnabled: false },
  { id: 'tl2', tenantName: 'Delhi NCR Diagnostic', defaultLocale: 'hi-IN', fallbackLocale: 'en-IN', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-IN', rtlEnabled: false },
  { id: 'tl3', tenantName: 'Chennai South Branch', defaultLocale: 'ta-IN', fallbackLocale: 'en-IN', dateFormat: 'DD/MM/YYYY', numberFormat: 'en-IN', rtlEnabled: false },
  { id: 'tl4', tenantName: 'Dubai Health Partner', defaultLocale: 'ar-AE', fallbackLocale: 'en-IN', dateFormat: 'DD/MM/YYYY', numberFormat: 'ar-AE', rtlEnabled: true },
  { id: 'tl5', tenantName: 'Bangalore Health Hub', defaultLocale: 'en-IN', fallbackLocale: 'en-IN', dateFormat: 'YYYY-MM-DD', numberFormat: 'en-IN', rtlEnabled: false },
];
