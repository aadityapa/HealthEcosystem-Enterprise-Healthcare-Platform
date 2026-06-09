import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { PayrollService } from './payroll.service';
import { CreatePayrollRunDto } from './dto/payroll.dto';

@ApiTags('HRMS Payroll')
@Controller('api/v1/hrms/payroll')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Post('runs')
  @ApiOperation({ summary: 'Create payroll run' })
  createRun(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreatePayrollRunDto) {
    return this.payrollService.createRun(ctx, dto);
  }

  @Post('runs/:id/process')
  @ApiOperation({ summary: 'Process payroll run' })
  processRun(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.payrollService.processRun(ctx, id);
  }

  @Get('runs/:id/lines')
  @ApiOperation({ summary: 'Get payroll lines' })
  getLines(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.payrollService.getLines(ctx, id);
  }
}
