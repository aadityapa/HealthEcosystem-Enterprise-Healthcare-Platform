import type {
  BrandingDashboardStats,
  BrandingTheme,
  FeatureFlag,
  FranchiseBranding,
} from '@/types';

export const mockBrandingDashboardStats: BrandingDashboardStats = {
  activeThemes: 6,
  featureFlags: 34,
  franchiseTenants: 18,
  customDomains: 12,
  themesTrend: 16.7,
  flagsTrend: 8.2,
  tenantsTrend: 12.5,
  domainsTrend: 20.0,
};

export const mockBrandingThemes: BrandingTheme[] = [
  { id: 'th1', themeCode: 'THEME-DEFAULT', name: 'HealthEcosystem Default', primaryColor: '#2563eb', logoUrl: '/branding/default-logo.svg', appliedTo: 'Platform default', status: 'active' },
  { id: 'th2', themeCode: 'THEME-MUMBAI', name: 'Mumbai Central Brand', primaryColor: '#0d9488', logoUrl: '/branding/mumbai-logo.svg', appliedTo: 'Mumbai Central Lab', status: 'active' },
  { id: 'th3', themeCode: 'THEME-DELHI', name: 'Delhi NCR Brand', primaryColor: '#7c3aed', logoUrl: '/branding/delhi-logo.svg', appliedTo: 'Delhi NCR Diagnostic', status: 'active' },
  { id: 'th4', themeCode: 'THEME-WELLNESS', name: 'Wellness Partner Theme', primaryColor: '#16a34a', logoUrl: '/branding/wellness-logo.svg', appliedTo: 'Marketplace partners', status: 'active' },
  { id: 'th5', themeCode: 'THEME-DARK', name: 'Dark Mode Variant', primaryColor: '#3b82f6', logoUrl: '/branding/default-logo.svg', appliedTo: 'All tenants (optional)', status: 'draft' },
];

export const mockFeatureFlags: FeatureFlag[] = [
  { id: 'ff1', flagKey: 'ai_clinical_insights', name: 'Clinical AI Insights', description: 'Enable AI-powered result interpretation', enabledFor: 'All tenants', rolloutPercent: 100, status: 'enabled' },
  { id: 'ff2', flagKey: 'abdm_consent_v2', name: 'ABDM Consent V2', description: 'New consent artefact flow', enabledFor: 'Pilot tenants', rolloutPercent: 25, status: 'partial' },
  { id: 'ff3', flagKey: 'marketplace_b2c', name: 'Marketplace B2C', description: 'Consumer marketplace ordering', enabledFor: 'Selected franchises', rolloutPercent: 60, status: 'partial' },
  { id: 'ff4', flagKey: 'voice_assistant', name: 'Voice Assistant', description: 'Voice-based patient queries', enabledFor: 'None', rolloutPercent: 0, status: 'disabled' },
  { id: 'ff5', flagKey: 'radiology_pacs_v2', name: 'PACS V2 Integration', description: 'Enhanced DICOM viewer', enabledFor: 'Radiology-enabled branches', rolloutPercent: 40, status: 'partial' },
];

export const mockFranchiseBranding: FranchiseBranding[] = [
  { id: 'fb1', franchiseCode: 'FR-MUM-001', franchiseName: 'Mumbai Central Franchise', theme: 'Mumbai Central Brand', customDomain: 'labs.mumbaicentral.in', branches: 4, status: 'active' },
  { id: 'fb2', franchiseCode: 'FR-DEL-001', franchiseName: 'Delhi NCR Franchise', theme: 'Delhi NCR Brand', customDomain: 'diagnostics.delhincr.in', branches: 3, status: 'active' },
  { id: 'fb3', franchiseCode: 'FR-BLR-001', franchiseName: 'Bangalore Health Hub', theme: 'HealthEcosystem Default', branches: 2, status: 'active' },
  { id: 'fb4', franchiseCode: 'FR-PUN-001', franchiseName: 'Pune West Collection', theme: 'HealthEcosystem Default', customDomain: 'pune.healthlab.in', branches: 1, status: 'pending' },
  { id: 'fb5', franchiseCode: 'FR-CHN-001', franchiseName: 'Chennai South Branch', theme: 'HealthEcosystem Default', branches: 1, status: 'suspended' },
];
