import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';

@ApiTags('Compliance Dashboard')
@Controller('api/v1/compliance/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Overall compliance score per framework' })
  getOverview() {
    return this.dashboardService.getOverview();
  }
}
