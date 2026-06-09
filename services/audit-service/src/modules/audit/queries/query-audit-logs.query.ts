import { AuditAction } from '@health/db';

export interface AuditLogDateRange {
  from?: Date;
  to?: Date;
}

export class QueryAuditLogsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly page: number = 1,
    public readonly limit: number = 20,
    public readonly userId?: string,
    public readonly organizationId?: string,
    public readonly branchId?: string,
    public readonly entityType?: string,
    public readonly entityId?: string,
    public readonly action?: AuditAction,
    public readonly dateRange?: AuditLogDateRange,
  ) {}
}
