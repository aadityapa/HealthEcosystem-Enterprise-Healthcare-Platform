import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { StudiesService } from './studies.service';
import {
  CreateStudyDto,
  ListStudiesQueryDto,
  ScheduleStudyDto,
  UpdateStudyDto,
} from './dto/studies.dto';

@ApiTags('Radiology Studies')
@Controller('api/v1/radiology/studies')
export class StudiesController {
  constructor(private readonly studiesService: StudiesService) {}

  @Post()
  @ApiOperation({ summary: 'Create radiology study' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateStudyDto) {
    return this.studiesService.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List radiology studies' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListStudiesQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.studiesService.list(ctx, filters, pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get radiology study' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.studiesService.getById(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update radiology study' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStudyDto,
  ) {
    return this.studiesService.update(ctx, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete radiology study' })
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.studiesService.remove(ctx, id);
  }

  @Post(':id/schedule')
  @ApiOperation({ summary: 'Schedule radiology study' })
  schedule(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ScheduleStudyDto,
  ) {
    return this.studiesService.schedule(ctx, id, dto);
  }

  @Post(':id/perform')
  @ApiOperation({ summary: 'Mark study as in progress' })
  perform(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.studiesService.perform(ctx, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete radiology study' })
  complete(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.studiesService.complete(ctx, id);
  }
}
