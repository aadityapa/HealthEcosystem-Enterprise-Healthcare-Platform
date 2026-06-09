import { Module } from '@nestjs/common';
import { DeviceMonitoringService } from './device-monitoring.service';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [QueueModule],
  providers: [DeviceMonitoringService],
  exports: [DeviceMonitoringService],
})
export class MonitorModule {}
