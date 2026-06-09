export const TENANT_HEADERS = {
  tenantId: 'x-tenant-id',
  organizationId: 'x-organization-id',
  branchId: 'x-branch-id',
  userId: 'x-user-id',
} as const;

export interface ServiceRequestContext {
  tenantId: string;
  organizationId: string;
  branchId: string;
  userId: string;
}
