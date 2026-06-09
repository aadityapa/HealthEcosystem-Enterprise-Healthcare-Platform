export const colors = {
  primary: {
    50: '#E6F7F5',
    100: '#B3E8E2',
    200: '#80D9CF',
    300: '#4DCABC',
    400: '#1ABBA9',
    500: '#0D9488',
    600: '#0B7A71',
    700: '#086058',
    800: '#064740',
    900: '#032E28',
  },
  secondary: {
    500: '#1E3A5F',
    700: '#152A45',
    900: '#0C1A2B',
  },
  accent: {
    500: '#3B82F6',
    600: '#2563EB',
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  status: {
    ordered: '#94A3B8',
    collected: '#3B82F6',
    processing: '#F59E0B',
    verified: '#8B5CF6',
    approved: '#10B981',
    rejected: '#EF4444',
    reported: '#0D9488',
    critical: '#DC2626',
  },
  gray: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },
} as const;

export type StatusVariant =
  | 'ordered'
  | 'collected'
  | 'processing'
  | 'verified'
  | 'approved'
  | 'rejected'
  | 'reported'
  | 'critical'
  | 'pending'
  | 'active'
  | 'inactive';
