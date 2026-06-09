import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { SlaService } from './sla.service';

@ApiTags('Customer Success SLA')
@Controller('api/v1/customer-success/sla')
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Get()
  @ApiOperation({ summary: 'Customer SLA dashboard (observability stub)' })
  getDashboard(@ServiceContext() ctx: ServiceRequestContext) {
    return this.slaService.getDashboard(ctx);
  }
}
