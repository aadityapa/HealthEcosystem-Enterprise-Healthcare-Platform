import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BillingContext } from '@/common/decorators/billing.decorators';
import type { BillingRequestContext } from '@/common/context/billing-context';
import { GstReportService } from './gst-report.service';

@ApiTags('GST')
@Controller('api/v1/billing/gst')
export class GstController {
  constructor(private readonly gstReportService: GstReportService) {}

  @Get('report')
  @ApiOperation({ summary: 'Get GST report for period (YYYY-MM)' })
  getReport(
    @BillingContext() ctx: BillingRequestContext,
    @Query('period') period: string,
  ) {
    return this.gstReportService.getReport(ctx, period);
  }

  @Get('export')
  @ApiOperation({ summary: 'Export GSTR-1 format JSON' })
  export(
    @BillingContext() ctx: BillingRequestContext,
    @Query('period') period: string,
  ) {
    return this.gstReportService.exportGstr1(ctx, period);
  }
}
