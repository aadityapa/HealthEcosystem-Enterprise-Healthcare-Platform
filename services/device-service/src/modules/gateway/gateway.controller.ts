import { Body, Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsString } from '@health/validation';
import { DeviceContext } from '@/common/decorators/device.decorators';
import type { DeviceRequestContext } from '@/common/context/device-context';
import { GatewayService } from './gateway.service';

export class IngestMessageDto {
  @IsString()
  payload!: string;
}

@ApiTags('Device Gateway')
@Controller('api/v1/devices')
export class GatewayController {
  constructor(private readonly gatewayService: GatewayService) {}

  @Post('ingest/:deviceId')
  @ApiOperation({ summary: 'Ingest raw device message' })
  ingest(
    @DeviceContext() ctx: DeviceRequestContext,
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
    @Body() dto: IngestMessageDto,
  ) {
    return this.gatewayService.ingest(ctx, deviceId, dto.payload);
  }
}
