import { Module } from '@nestjs/common';
import { QcController } from './qc.controller';
import { QcAnalyticsService } from './qc.service';

@Module({
  controllers: [QcController],
  providers: [QcAnalyticsService],
})
export class QcModule {}
