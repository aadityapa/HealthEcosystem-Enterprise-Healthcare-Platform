import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { TrainingService } from './training.service';
import { CreateTrainingDto, ListTrainingQueryDto } from './dto/training.dto';

@ApiTags('HRMS Training')
@Controller('api/v1/hrms/training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post()
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateTrainingDto) {
    return this.trainingService.create(ctx, dto);
  }

  @Get()
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListTrainingQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.trainingService.list(ctx, filters, pagination.page, pagination.limit);
  }

  @Get(':id')
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.trainingService.getById(ctx, id);
  }
}
