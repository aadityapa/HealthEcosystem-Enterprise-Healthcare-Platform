import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { BranchFilterQueryDto } from '@/common/dto/analytics-query.dto';
import { DevicesAnalyticsService } from './devices.service';

@ApiTags('Analytics Devices')
@Controller('api/v1/analytics/devices')
export class DevicesController {
  constructor(private readonly devicesService: DevicesAnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Device uptime and message volume' })
  getDevices(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: BranchFilterQueryDto,
  ) {
    return this.devicesService.getDeviceAnalytics(ctx, query);
  }
}
