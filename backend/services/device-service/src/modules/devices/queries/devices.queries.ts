import type { DeviceRequestContext } from '@/common/context/device-context';
import type { ListDevicesQueryDto } from '../dto/devices.dto';

export class GetDeviceQuery {
  constructor(
    public readonly ctx: DeviceRequestContext,
    public readonly deviceId: string,
  ) {}
}

export class ListDevicesQuery {
  constructor(
    public readonly ctx: DeviceRequestContext,
    public readonly filters: ListDevicesQueryDto,
  ) {}
}

export class GetDeviceHealthQuery {
  constructor(
    public readonly ctx: DeviceRequestContext,
    public readonly deviceId: string,
  ) {}
}
