import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DeviceController } from './devices.controller';
import { DevicesService } from './devices.service';
import {
  RegisterDeviceHandler,
  UpdateDeviceHandler,
  ConfigureDeviceHandler,
  GetDeviceHandler,
  ListDevicesHandler,
  GetDeviceHealthHandler,
} from './handlers/devices.handlers';
import { MonitorModule } from '../monitor/monitor.module';

const CommandHandlers = [
  RegisterDeviceHandler,
  UpdateDeviceHandler,
  ConfigureDeviceHandler,
];

const QueryHandlers = [GetDeviceHandler, ListDevicesHandler, GetDeviceHealthHandler];

@Module({
  imports: [CqrsModule, MonitorModule],
  controllers: [DeviceController],
  providers: [DevicesService, ...CommandHandlers, ...QueryHandlers],
  exports: [DevicesService],
})
export class DevicesModule {}
