import { Injectable } from '@nestjs/common';
import type { DeviceRequestContext } from '@/common/context/device-context';
import { DevicesService } from '../devices/devices.service';
import { ResultProcessorService } from '../processor/result-processor.service';

@Injectable()
export class GatewayService {
  constructor(
    private readonly devicesService: DevicesService,
    private readonly resultProcessor: ResultProcessorService,
  ) {}

  async ingest(ctx: DeviceRequestContext, deviceId: string, rawPayload: string) {
    const device = await this.devicesService.getDeviceOrThrow(ctx, deviceId);
    return this.resultProcessor.processIngestion(ctx, device, rawPayload);
  }
}
