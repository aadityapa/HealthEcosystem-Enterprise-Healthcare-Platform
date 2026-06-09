import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { DashboardService } from './dashboard.service';

@ApiTags('Security Dashboard')
@Controller('api/v1/security/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'SOC overview: incidents, threats, vulns, certs' })
  getOverview(@ServiceContext() ctx: ServiceRequestContext) {
    return this.dashboardService.getOverview(ctx);
  }
}
