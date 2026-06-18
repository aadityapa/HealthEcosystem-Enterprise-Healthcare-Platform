import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import type { Device } from '@health/db';
import type { PaginationMeta } from '@health/shared-types';
import {
  RegisterDeviceCommand,
  UpdateDeviceCommand,
  ConfigureDeviceCommand,
} from '../commands/devices.commands';
import {
  GetDeviceQuery,
  ListDevicesQuery,
  GetDeviceHealthQuery,
} from '../queries/devices.queries';
import { DevicesService } from '../devices.service';
import { DeviceMonitoringService } from '../../monitor/device-monitoring.service';

@CommandHandler(RegisterDeviceCommand)
export class RegisterDeviceHandler implements ICommandHandler<RegisterDeviceCommand> {
  constructor(private readonly devicesService: DevicesService) {}
  execute(command: RegisterDeviceCommand): Promise<Device> {
    return this.devicesService.registerDevice(command.ctx, command.dto);
  }
}

@CommandHandler(UpdateDeviceCommand)
export class UpdateDeviceHandler implements ICommandHandler<UpdateDeviceCommand> {
  constructor(private readonly devicesService: DevicesService) {}
  execute(command: UpdateDeviceCommand): Promise<Device> {
    return this.devicesService.updateDevice(command.ctx, command.deviceId, command.dto);
  }
}

@CommandHandler(ConfigureDeviceCommand)
export class ConfigureDeviceHandler implements ICommandHandler<ConfigureDeviceCommand> {
  constructor(private readonly devicesService: DevicesService) {}
  execute(command: ConfigureDeviceCommand): Promise<Device> {
    return this.devicesService.configureDevice(command.ctx, command.deviceId, command.dto);
  }
}

@QueryHandler(GetDeviceQuery)
export class GetDeviceHandler implements IQueryHandler<GetDeviceQuery> {
  constructor(private readonly devicesService: DevicesService) {}
  execute(query: GetDeviceQuery) {
    return this.devicesService.getDevice(query.ctx, query.deviceId);
  }
}

@QueryHandler(ListDevicesQuery)
export class ListDevicesHandler implements IQueryHandler<ListDevicesQuery> {
  constructor(private readonly devicesService: DevicesService) {}
  execute(query: ListDevicesQuery): Promise<{ items: Device[]; meta: PaginationMeta }> {
    return this.devicesService.listDevices(query.ctx, query.filters);
  }
}

@QueryHandler(GetDeviceHealthQuery)
export class GetDeviceHealthHandler implements IQueryHandler<GetDeviceHealthQuery> {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly monitoring: DeviceMonitoringService,
  ) {}
  async execute(query: GetDeviceHealthQuery) {
    await this.devicesService.getDeviceOrThrow(query.ctx, query.deviceId);
    return this.monitoring.getLatestHealth(query.deviceId, query.ctx.tenantId);
  }
}
