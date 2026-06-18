import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuditAction, AuditLog, Prisma } from '@health/db';
import { paginationMeta } from '@health/validation';
import { v4 as uuidv4 } from 'uuid';
import { CreateAuditLogCommand } from './commands/create-audit-log.command';
import { QueryAuditLogsQuery } from './queries/query-audit-logs.query';
import { ExportAuditLogsQuery } from './queries/export-audit-logs.query';
import { AuditRepository, type AuditLogFilters } from './audit.repository';
import type { AuditLogDateRange } from './queries/query-audit-logs.query';

export interface CreateAuditLogInput {
  tenantId: string;
  action: AuditAction;
  entityType: string;
  organizationId?: string;
  branchId?: string;
  userId?: string;
  entityId?: string;
  oldValue?: Prisma.InputJsonValue;
  newValue?: Prisma.InputJsonValue;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  metadata?: Prisma.InputJsonValue;
}

export interface QueryAuditLogsInput {
  tenantId: string;
  page?: number;
  limit?: number;
  userId?: string;
  organizationId?: string;
  branchId?: string;
  entityType?: string;
  entityId?: string;
  action?: AuditAction;
  dateRange?: AuditLogDateRange;
}

export interface ExportAuditLogsInput extends Omit<QueryAuditLogsInput, 'page' | 'limit'> {
  maxRecords?: number;
  exportedBy?: string;
}

export interface PaginatedAuditLogs {
  items: AuditLog[];
  meta: ReturnType<typeof paginationMeta>;
}

export interface AuditLogExportResult {
  exportId: string;
  exportedAt: string;
  exportedBy?: string;
  filters: AuditLogFilters;
  recordCount: number;
  totalMatching: number;
  truncated: boolean;
  items: AuditLog[];
}

@Injectable()
export class AuditService {
  constructor(
    private readonly repository: AuditRepository,
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async createLog(input: CreateAuditLogInput): Promise<AuditLog> {
    return this.repository.create({
      tenantId: input.tenantId,
      organizationId: input.organizationId,
      branchId: input.branchId,
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      oldValue: input.oldValue,
      newValue: input.newValue,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
      requestId: input.requestId,
      metadata: input.metadata ?? {},
    });
  }

  async queryLogs(input: QueryAuditLogsInput): Promise<PaginatedAuditLogs> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const filters = this.toFilters(input);

    const { items, total } = await this.repository.findMany(filters, page, limit);

    return {
      items,
      meta: paginationMeta(total, page, limit),
    };
  }

  async exportLogs(input: ExportAuditLogsInput): Promise<AuditLogExportResult> {
    const maxRecords = input.maxRecords ?? 10_000;
    const filters = this.toFilters(input);

    const { items, truncated, total } = await this.repository.findForExport(
      filters,
      maxRecords,
    );

    return {
      exportId: uuidv4(),
      exportedAt: new Date().toISOString(),
      exportedBy: input.exportedBy,
      filters,
      recordCount: items.length,
      totalMatching: total,
      truncated,
      items,
    };
  }

  dispatchCreate(command: CreateAuditLogCommand): Promise<AuditLog> {
    return this.commandBus.execute(command);
  }

  dispatchQuery(query: QueryAuditLogsQuery): Promise<PaginatedAuditLogs> {
    return this.queryBus.execute(query);
  }

  dispatchExport(query: ExportAuditLogsQuery): Promise<AuditLogExportResult> {
    return this.queryBus.execute(query);
  }

  private toFilters(
    input: QueryAuditLogsInput | ExportAuditLogsInput,
  ): AuditLogFilters {
    return {
      tenantId: input.tenantId,
      userId: input.userId,
      organizationId: input.organizationId,
      branchId: input.branchId,
      entityType: input.entityType,
      entityId: input.entityId,
      action: input.action,
      dateRange: input.dateRange,
    };
  }
}
