export interface TenantContext {
  tenantId: string;
  organizationId: string;
  branchId: string;
  userId: string;
  permissions: string[];
  roles: string[];
}

export interface JwtPayload {
  sub: string;
  tenantId: string;
  organizationId?: string;
  email: string;
  roles: string[];
  permissions: string[];
  branchIds: string[];
  mfaVerified: boolean;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ApiMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: unknown[];
  requestId?: string;
}

export interface ApiMeta {
  requestId?: string;
  timestamp?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export type OrderSource = 'walk_in' | 'online' | 'home_collection' | 'corporate' | 'referral';
export type OrderPriority = 'routine' | 'urgent' | 'stat';

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country?: string;
}

export interface ContactInfo {
  phone: string;
  alternatePhone?: string;
  email?: string;
}

export * from './events';
export * from './permissions';
