import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { DateRangeQueryDto } from '@/common/dto/analytics-query.dto';
import { ExecutiveService } from './executive.service';

@ApiTags('Analytics Executive')
@Controller('api/v1/analytics/executive')
export class ExecutiveController {
  constructor(private readonly executiveService: ExecutiveService) {}

  @Get()
  @ApiOperation({ summary: 'Executive KPIs: revenue, orders, patients, branches' })
  getKpis(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: DateRangeQueryDto,
  ) {
    return this.executiveService.getKpis(ctx, query);
  }
}
