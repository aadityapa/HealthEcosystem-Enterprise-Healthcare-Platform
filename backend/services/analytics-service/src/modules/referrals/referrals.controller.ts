import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { DateRangeQueryDto } from '@/common/dto/analytics-query.dto';
import { ReferralsAnalyticsService } from './referrals.service';

@ApiTags('Analytics Referrals')
@Controller('api/v1/analytics/referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsAnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Doctor referral statistics' })
  getReferrals(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: DateRangeQueryDto,
  ) {
    return this.referralsService.getReferralStats(ctx, query);
  }
}
