import { Module } from '@nestjs/common';
import { DevicesController } from './devices.controller';
import { DevicesAnalyticsService } from './devices.service';

@Module({
  controllers: [DevicesController],
  providers: [DevicesAnalyticsService],
})
export class DevicesModule {}
