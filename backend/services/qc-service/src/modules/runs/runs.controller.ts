import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { RunsService } from './runs.service';
import { CreateQcRunDto, ListRunsQueryDto, RecordDataPointDto } from './dto/runs.dto';

@ApiTags('QC Runs')
@Controller('api/v1/qc/runs')
export class RunsController {
  constructor(private readonly runsService: RunsService) {}

  @Post()
  @ApiOperation({ summary: 'Create QC run' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateQcRunDto) {
    return this.runsService.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List QC runs' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListRunsQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.runsService.list(ctx, filters, pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get QC run' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.runsService.getById(ctx, id);
  }

  @Post(':id/data-points')
  @ApiOperation({ summary: 'Record data point and evaluate Westgard rules' })
  recordDataPoint(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RecordDataPointDto,
  ) {
    return this.runsService.recordDataPoint(ctx, id, dto);
  }
}
