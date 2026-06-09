import {
  Body,
  Controller,
  Delete,
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
import { PipelinesService } from './pipelines.service';
import {
  CreatePipelineDto,
  ListPipelinesQueryDto,
  UpdatePipelineDto,
} from './dto/pipelines.dto';

@ApiTags('Data Pipelines')
@Controller('api/v1/data/pipelines')
export class PipelinesController {
  constructor(private readonly pipelinesService: PipelinesService) {}

  @Get()
  @ApiOperation({ summary: 'List data pipelines' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: ListPipelinesQueryDto,
  ) {
    return this.pipelinesService.list(ctx, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get pipeline by ID' })
  getById(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.pipelinesService.getById(ctx, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create data pipeline' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreatePipelineDto,
  ) {
    return this.pipelinesService.create(ctx, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update data pipeline' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePipelineDto,
  ) {
    return this.pipelinesService.update(ctx, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete data pipeline' })
  remove(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.pipelinesService.remove(ctx, id);
  }

  @Post(':id/run')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Trigger pipeline run' })
  run(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.pipelinesService.run(ctx, id);
  }
}
