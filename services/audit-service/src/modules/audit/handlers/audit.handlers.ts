import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AuditLog } from '@health/db';
import { CreateAuditLogCommand } from '../commands/create-audit-log.command';
import { QueryAuditLogsQuery } from '../queries/query-audit-logs.query';
import { ExportAuditLogsQuery } from '../queries/export-audit-logs.query';
import { AuditService, AuditLogExportResult, PaginatedAuditLogs } from '../audit.service';

@CommandHandler(CreateAuditLogCommand)
export class CreateAuditLogHandler implements ICommandHandler<CreateAuditLogCommand> {
  constructor(private readonly auditService: AuditService) {}

  execute(command: CreateAuditLogCommand): Promise<AuditLog> {
    return this.auditService.createLog({
      tenantId: command.tenantId,
      organizationId: command.organizationId,
      branchId: command.branchId,
      userId: command.userId,
      action: command.action,
      entityType: command.entityType,
      entityId: command.entityId,
      oldValue: command.oldValue,
      newValue: command.newValue,
      ipAddress: command.ipAddress,
      userAgent: command.userAgent,
      requestId: command.requestId,
      metadata: command.metadata,
    });
  }
}

@QueryHandler(QueryAuditLogsQuery)
export class QueryAuditLogsHandler implements IQueryHandler<QueryAuditLogsQuery> {
  constructor(private readonly auditService: AuditService) {}

  execute(query: QueryAuditLogsQuery): Promise<PaginatedAuditLogs> {
    return this.auditService.queryLogs({
      tenantId: query.tenantId,
      page: query.page,
      limit: query.limit,
      userId: query.userId,
      organizationId: query.organizationId,
      branchId: query.branchId,
      entityType: query.entityType,
      entityId: query.entityId,
      action: query.action,
      dateRange: query.dateRange,
    });
  }
}

@QueryHandler(ExportAuditLogsQuery)
export class ExportAuditLogsHandler implements IQueryHandler<ExportAuditLogsQuery> {
  constructor(private readonly auditService: AuditService) {}

  execute(query: ExportAuditLogsQuery): Promise<AuditLogExportResult> {
    return this.auditService.exportLogs({
      tenantId: query.tenantId,
      userId: query.userId,
      organizationId: query.organizationId,
      branchId: query.branchId,
      entityType: query.entityType,
      entityId: query.entityId,
      action: query.action,
      dateRange: query.dateRange,
      maxRecords: query.maxRecords,
      exportedBy: query.exportedBy,
    });
  }
}
