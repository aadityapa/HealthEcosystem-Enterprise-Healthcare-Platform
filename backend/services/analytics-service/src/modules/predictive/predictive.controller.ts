import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { DateRangeQueryDto } from '@/common/dto/analytics-query.dto';
import { PredictiveService } from './predictive.service';

@ApiTags('Analytics Predictive')
@Controller('api/v1/analytics/predictive')
export class PredictiveController {
  constructor(private readonly predictiveService: PredictiveService) {}

  @Get()
  @ApiOperation({ summary: 'Predictive forecasts from active models' })
  getForecasts(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: DateRangeQueryDto,
  ) {
    return this.predictiveService.getForecasts(ctx, query);
  }
}
