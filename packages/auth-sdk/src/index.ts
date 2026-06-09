import type { JwtPayload, TenantContext } from '@health/shared-types';

export function hasPermission(context: TenantContext, permission: string): boolean {
  return context.permissions.includes(permission);
}

export function hasAnyPermission(context: TenantContext, permissions: string[]): boolean {
  return permissions.some((p) => context.permissions.includes(p));
}

export function hasAllPermissions(context: TenantContext, permissions: string[]): boolean {
  return permissions.every((p) => context.permissions.includes(p));
}

export function hasRole(context: TenantContext, role: string): boolean {
  return context.roles.includes(role);
}

export function canAccessBranch(context: TenantContext, branchId: string): boolean {
  return context.branchId === branchId || context.roles.includes('tenant_admin');
}

export function extractTenantContext(payload: JwtPayload): TenantContext {
  return {
    tenantId: payload.tenantId,
    organizationId: payload.organizationId ?? '',
    branchId: payload.branchIds[0] ?? '',
    userId: payload.sub,
    permissions: payload.permissions,
    roles: payload.roles,
  };
}

export const AUTH_HEADERS = {
  AUTHORIZATION: 'authorization',
  TENANT_ID: 'x-tenant-id',
  BRANCH_ID: 'x-branch-id',
  REQUEST_ID: 'x-request-id',
} as const;
