import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { TrendQueryDto } from '@/common/dto/analytics-query.dto';
import { RevenueService } from './revenue.service';

@ApiTags('Analytics Revenue')
@Controller('api/v1/analytics/revenue')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get()
  @ApiOperation({ summary: 'Revenue trends (daily/monthly) and breakdown by branch' })
  getRevenue(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: TrendQueryDto,
  ) {
    return this.revenueService.getRevenueAnalytics(ctx, query);
  }
}
