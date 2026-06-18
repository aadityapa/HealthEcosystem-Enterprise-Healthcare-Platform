import type { DeviceRequestContext } from '@/common/context/device-context';
import type {
  ConfigureDeviceDto,
  RegisterDeviceDto,
  UpdateDeviceDto,
} from '../dto/devices.dto';

export class RegisterDeviceCommand {
  constructor(
    public readonly ctx: DeviceRequestContext,
    public readonly dto: RegisterDeviceDto,
  ) {}
}

export class UpdateDeviceCommand {
  constructor(
    public readonly ctx: DeviceRequestContext,
    public readonly deviceId: string,
    public readonly dto: UpdateDeviceDto,
  ) {}
}

export class ConfigureDeviceCommand {
  constructor(
    public readonly ctx: DeviceRequestContext,
    public readonly deviceId: string,
    public readonly dto: ConfigureDeviceDto,
  ) {}
}
