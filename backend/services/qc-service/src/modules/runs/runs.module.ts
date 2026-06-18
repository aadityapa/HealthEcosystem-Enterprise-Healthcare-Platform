import { Module } from '@nestjs/common';
import { QcServicesModule } from '@/services/qc-services.module';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';

@Module({
  imports: [QcServicesModule],
  controllers: [RunsController],
  providers: [RunsService],
  exports: [RunsService],
})
export class RunsModule {}
