import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation, ApiSecurity } from '@nestjs/swagger';
import { Prisma } from '@health/db';
import {
  CreateAuditLogDto,
  QueryAuditLogsDto,
  ExportAuditLogsDto,
} from './dto/audit.dto';
import { CreateAuditLogCommand } from './commands/create-audit-log.command';
import { QueryAuditLogsQuery } from './queries/query-audit-logs.query';
import { ExportAuditLogsQuery } from './queries/export-audit-logs.query';
import { InternalServiceGuard } from '@/common/guards/internal-service.guard';
import { RequestMeta, type RequestMetaData } from '@/common/decorators/request-meta.decorator';

@ApiTags('Audit')
@Controller('api/v1/audit/logs')
@UseGuards(InternalServiceGuard)
@ApiSecurity('internal')
export class AuditController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Query audit logs with filters and pagination' })
  async queryLogs(@Query() dto: QueryAuditLogsDto) {
    const data = await this.queryBus.execute(
      new QueryAuditLogsQuery(
        dto.tenantId,
        dto.page,
        dto.limit,
        dto.userId,
        dto.organizationId,
        dto.branchId,
        dto.entityType,
        dto.entityId,
        dto.action,
        this.toDateRange(dto.from, dto.to),
      ),
    );
    return { success: true, data };
  }

  @Get('export')
  @ApiOperation({
    summary: 'Export audit logs for compliance (immutable snapshot)',
  })
  async exportLogs(@Query() dto: ExportAuditLogsDto) {
    const data = await this.queryBus.execute(
      new ExportAuditLogsQuery(
        dto.tenantId,
        dto.userId,
        dto.organizationId,
        dto.branchId,
        dto.entityType,
        dto.entityId,
        dto.action,
        this.toDateRange(dto.from, dto.to),
        dto.maxRecords,
        dto.exportedBy,
      ),
    );
    return { success: true, data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Append audit log entry (internal service calls only)' })
  async createLog(
    @Body() dto: CreateAuditLogDto,
    @RequestMeta() meta: RequestMetaData,
  ) {
    const data = await this.commandBus.execute(
      new CreateAuditLogCommand(
        dto.tenantId,
        dto.action,
        dto.entityType,
        dto.organizationId,
        dto.branchId,
        dto.userId,
        dto.entityId,
        dto.oldValue as Prisma.InputJsonValue | undefined,
        dto.newValue as Prisma.InputJsonValue | undefined,
        meta.ipAddress,
        meta.userAgent,
        meta.requestId,
        dto.metadata as Prisma.InputJsonValue | undefined,
      ),
    );
    return { success: true, data };
  }

  private toDateRange(from?: string, to?: string) {
    if (!from && !to) {
      return undefined;
    }
    return {
      ...(from ? { from: new Date(from) } : {}),
      ...(to ? { to: new Date(to) } : {}),
    };
  }
}
