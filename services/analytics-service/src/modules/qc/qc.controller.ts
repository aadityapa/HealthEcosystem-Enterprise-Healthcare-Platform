import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { BranchFilterQueryDto } from '@/common/dto/analytics-query.dto';
import { QcAnalyticsService } from './qc.service';

@ApiTags('Analytics QC')
@Controller('api/v1/analytics/qc')
export class QcController {
  constructor(private readonly qcService: QcAnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'QC failure rates and Westgard violations' })
  getQc(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: BranchFilterQueryDto,
  ) {
    return this.qcService.getQcAnalytics(ctx, query);
  }
}
