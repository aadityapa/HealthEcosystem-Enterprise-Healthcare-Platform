import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { RevenueService } from './revenue.service';

@ApiTags('Commercial Revenue')
@Controller('api/v1/commercial/revenue')
export class RevenueController {
  constructor(private readonly revenueService: RevenueService) {}

  @Get()
  @ApiOperation({ summary: 'MRR and ARR revenue dashboard' })
  getDashboard(@ServiceContext() ctx: ServiceRequestContext) {
    return this.revenueService.getDashboard(ctx);
  }
}
