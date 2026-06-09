import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { SalesService } from './sales.service';
import {
  CreateSalesTargetDto,
  DashboardQueryDto,
  UpdateSalesTargetDto,
} from './dto/sales.dto';

@ApiTags('CRM Sales')
@Controller('api/v1/crm/sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Sales dashboard statistics' })
  dashboard(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: DashboardQueryDto,
  ) {
    return this.salesService.getDashboard(ctx, query);
  }

  @Get('targets')
  @ApiOperation({ summary: 'List sales targets' })
  listTargets(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: DashboardQueryDto,
  ) {
    return this.salesService.listTargets(
      ctx,
      query.periodMonth,
      query.periodYear,
    );
  }

  @Post('targets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create sales target' })
  createTarget(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateSalesTargetDto,
  ) {
    return this.salesService.createTarget(ctx, dto);
  }

  @Patch('targets/:id')
  @ApiOperation({ summary: 'Update sales target' })
  updateTarget(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalesTargetDto,
  ) {
    return this.salesService.updateTarget(ctx, id, dto);
  }
}
