import { AuditAction, Prisma } from '@health/db';

export class CreateAuditLogCommand {
  constructor(
    public readonly tenantId: string,
    public readonly action: AuditAction,
    public readonly entityType: string,
    public readonly organizationId?: string,
    public readonly branchId?: string,
    public readonly userId?: string,
    public readonly entityId?: string,
    public readonly oldValue?: Prisma.InputJsonValue,
    public readonly newValue?: Prisma.InputJsonValue,
    public readonly ipAddress?: string,
    public readonly userAgent?: string,
    public readonly requestId?: string,
    public readonly metadata?: Prisma.InputJsonValue,
  ) {}
}
