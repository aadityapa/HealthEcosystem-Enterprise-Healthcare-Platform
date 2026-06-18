import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { TopTestsQueryDto } from '@/common/dto/analytics-query.dto';
import { TestsAnalyticsService } from './tests.service';

@ApiTags('Analytics Tests')
@Controller('api/v1/analytics/tests')
export class TestsController {
  constructor(private readonly testsService: TestsAnalyticsService) {}

  @Get()
  @ApiOperation({ summary: 'Top tests and volume trends' })
  getTests(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: TopTestsQueryDto,
  ) {
    return this.testsService.getTestAnalytics(ctx, query);
  }
}
