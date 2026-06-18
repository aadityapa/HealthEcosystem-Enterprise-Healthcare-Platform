import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { DashboardsService } from './dashboards.service';

@ApiTags('Observability Dashboards')
@Controller('api/v1/observability/dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get()
  @ApiOperation({ summary: 'List Grafana dashboard embed URLs (stub)' })
  list(
    @ServiceContext() _ctx: ServiceRequestContext,
  ) {
    return this.dashboardsService.listEmbedUrls();
  }
}
