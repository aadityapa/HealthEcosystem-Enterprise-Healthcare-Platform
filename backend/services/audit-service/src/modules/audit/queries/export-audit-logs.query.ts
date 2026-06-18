import { AuditAction } from '@health/db';
import type { AuditLogDateRange } from './query-audit-logs.query';

export class ExportAuditLogsQuery {
  constructor(
    public readonly tenantId: string,
    public readonly userId?: string,
    public readonly organizationId?: string,
    public readonly branchId?: string,
    public readonly entityType?: string,
    public readonly entityId?: string,
    public readonly action?: AuditAction,
    public readonly dateRange?: AuditLogDateRange,
    public readonly maxRecords: number = 10_000,
    public readonly exportedBy?: string,
  ) {}
}
