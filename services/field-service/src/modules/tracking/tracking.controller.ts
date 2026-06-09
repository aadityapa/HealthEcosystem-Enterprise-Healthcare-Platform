import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { TrackingService } from './tracking.service';
import { GpsHistoryQueryDto, RecordGpsPingDto } from './dto/tracking.dto';

@ApiTags('GPS Tracking')
@Controller('api/v1/field/tracking')
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Post('ping')
  @ApiOperation({ summary: 'Record GPS ping' })
  ping(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: RecordGpsPingDto) {
    return this.trackingService.recordPing(ctx, dto);
  }

  @Get('history')
  @ApiOperation({ summary: 'Get GPS ping history' })
  history(@ServiceContext() ctx: ServiceRequestContext, @Query() query: GpsHistoryQueryDto) {
    return this.trackingService.getHistory(ctx, query);
  }
}
