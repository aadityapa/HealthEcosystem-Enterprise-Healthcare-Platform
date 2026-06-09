import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BillingContext } from '@/common/decorators/billing.decorators';
import type { BillingRequestContext } from '@/common/context/billing-context';
import { OutstandingService } from '@/services/outstanding.service';

@ApiTags('Outstanding')
@Controller('api/v1/billing/outstanding')
export class OutstandingController {
  constructor(private readonly outstandingService: OutstandingService) {}

  @Get()
  @ApiOperation({ summary: 'Get outstanding balances and aging report' })
  getAging(@BillingContext() ctx: BillingRequestContext) {
    return this.outstandingService.getAgingReport(ctx.tenantId, ctx.organizationId);
  }
}
