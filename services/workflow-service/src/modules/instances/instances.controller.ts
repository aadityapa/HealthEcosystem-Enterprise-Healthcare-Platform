import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { InstancesService } from './instances.service';
import { ListInstancesQueryDto, StartWorkflowInstanceDto } from './dto/instances.dto';

@ApiTags('Workflow Instances')
@Controller('api/v1/workflow/instances')
export class InstancesController {
  constructor(private readonly instancesService: InstancesService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a workflow instance from a definition' })
  start(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: StartWorkflowInstanceDto) {
    return this.instancesService.start(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List workflow instances' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListInstancesQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.instancesService.list(ctx, filters, pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow instance by ID' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.instancesService.getById(ctx, id);
  }
}
