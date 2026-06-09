import { Inject, Injectable } from '@nestjs/common';
import {
  AuditAction,
  AuditLog,
  Prisma,
  PrismaClient,
} from '@health/db';
import { paginate } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { AuditLogDateRange } from './queries/query-audit-logs.query';

export interface AuditLogFilters {
  tenantId: string;
  userId?: string;
  organizationId?: string;
  branchId?: string;
  entityType?: string;
  entityId?: string;
  action?: AuditAction;
  dateRange?: AuditLogDateRange;
}

export interface CreateAuditLogData {
  tenantId: string;
  organizationId?: string;
  branchId?: string;
  userId?: string;
  action: AuditAction;
  entityType: string;
  entityId?: string;
  oldValue?: Prisma.InputJsonValue;
  newValue?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditRepository {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(data: CreateAuditLogData): Promise<AuditLog> {
    return this.prisma.auditLog.create({ data });
  }

  async findMany(
    filters: AuditLogFilters,
    page: number,
    limit: number,
  ): Promise<{ items: AuditLog[]; total: number }> {
    const where = this.buildWhereClause(filters);
    const { skip, take } = paginate(page, limit);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return { items, total };
  }

  async findForExport(
    filters: AuditLogFilters,
    maxRecords: number,
  ): Promise<{ items: AuditLog[]; truncated: boolean; total: number }> {
    const where = this.buildWhereClause(filters);
    const total = await this.prisma.auditLog.count({ where });
    const take = Math.min(maxRecords, total);

    const items = await this.prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take,
    });

    return {
      items,
      truncated: total > maxRecords,
      total,
    };
  }

  private buildWhereClause(filters: AuditLogFilters): Prisma.AuditLogWhereInput {
    const createdAt: Prisma.DateTimeFilter | undefined =
      filters.dateRange?.from || filters.dateRange?.to
        ? {
            ...(filters.dateRange.from ? { gte: filters.dateRange.from } : {}),
            ...(filters.dateRange.to ? { lte: filters.dateRange.to } : {}),
          }
        : undefined;

    return {
      tenantId: filters.tenantId,
      ...(filters.organizationId ? { organizationId: filters.organizationId } : {}),
      ...(filters.branchId ? { branchId: filters.branchId } : {}),
      ...(filters.userId ? { userId: filters.userId } : {}),
      ...(filters.entityType ? { entityType: filters.entityType } : {}),
      ...(filters.entityId ? { entityId: filters.entityId } : {}),
      ...(filters.action ? { action: filters.action } : {}),
      ...(createdAt ? { createdAt } : {}),
    };
  }
}
