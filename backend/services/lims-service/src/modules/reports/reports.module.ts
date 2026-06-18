import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreServicesModule } from '@/services/core-services.module';
import { ReportsService } from './reports.service';
import { ReportHandlers } from './handlers/reports.handlers';
import { ReportsController } from './reports.controller';

@Module({
  imports: [CqrsModule, CoreServicesModule],
  controllers: [ReportsController],
  providers: [ReportsService, ...ReportHandlers],
})
export class ReportsModule {}
