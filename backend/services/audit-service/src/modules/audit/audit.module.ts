import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditRepository } from './audit.repository';
import {
  CreateAuditLogHandler,
  QueryAuditLogsHandler,
  ExportAuditLogsHandler,
} from './handlers/audit.handlers';
import { InternalServiceGuard } from '@/common/guards/internal-service.guard';

const CommandHandlers = [CreateAuditLogHandler];
const QueryHandlers = [QueryAuditLogsHandler, ExportAuditLogsHandler];

@Module({
  imports: [CqrsModule],
  controllers: [AuditController],
  providers: [
    AuditService,
    AuditRepository,
    InternalServiceGuard,
    ...CommandHandlers,
    ...QueryHandlers,
  ],
  exports: [AuditService],
})
export class AuditModule {}
