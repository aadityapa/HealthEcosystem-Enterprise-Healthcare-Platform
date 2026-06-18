import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DeviceContext } from '@/common/decorators/device.decorators';
import type { DeviceRequestContext } from '@/common/context/device-context';
import { AdaptersConfigService } from './adapters-config.service';
import { CreateAdapterConfigDto, UpdateAdapterConfigDto } from './adapters-config.dto';

@ApiTags('Adapter Configuration')
@Controller('api/v1/devices/adapters')
export class AdaptersConfigController {
  constructor(private readonly adaptersConfigService: AdaptersConfigService) {}

  @Post()
  @ApiOperation({ summary: 'Create adapter configuration' })
  create(
    @DeviceContext() ctx: DeviceRequestContext,
    @Body() dto: CreateAdapterConfigDto,
  ) {
    return this.adaptersConfigService.create(ctx, dto);
  }

  @Get('device/:deviceId')
  @ApiOperation({ summary: 'List adapter configs for a device' })
  listByDevice(
    @DeviceContext() ctx: DeviceRequestContext,
    @Param('deviceId', ParseUUIDPipe) deviceId: string,
  ) {
    return this.adaptersConfigService.listByDevice(ctx, deviceId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get adapter configuration' })
  get(
    @DeviceContext() ctx: DeviceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.adaptersConfigService.getById(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update adapter configuration' })
  update(
    @DeviceContext() ctx: DeviceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAdapterConfigDto,
  ) {
    return this.adaptersConfigService.update(ctx, id, dto);
  }
}
