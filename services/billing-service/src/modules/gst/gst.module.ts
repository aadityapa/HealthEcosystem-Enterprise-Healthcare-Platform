import { Module } from '@nestjs/common';
import { CoreServicesModule } from '@/services/core-services.module';
import { GstReportService } from './gst-report.service';
import { GstController } from './gst.controller';

@Module({
  imports: [CoreServicesModule],
  controllers: [GstController],
  providers: [GstReportService],
  exports: [GstReportService],
})
export class GstModule {}
