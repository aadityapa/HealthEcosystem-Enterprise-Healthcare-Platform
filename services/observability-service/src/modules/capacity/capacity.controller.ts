import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { CapacityService } from './capacity.service';
import {
  ListCapacityQueryDto,
  RecordCapacityMetricDto,
} from './dto/capacity.dto';

@ApiTags('Observability Capacity')
@Controller('api/v1/observability/capacity')
export class CapacityController {
  constructor(private readonly capacityService: CapacityService) {}

  @Get()
  @ApiOperation({ summary: 'List capacity metrics' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: ListCapacityQueryDto,
  ) {
    return this.capacityService.listMetrics(ctx, query);
  }

  @Post('metrics')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record capacity metric' })
  record(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: RecordCapacityMetricDto,
  ) {
    return this.capacityService.recordMetric(ctx, dto);
  }
}
