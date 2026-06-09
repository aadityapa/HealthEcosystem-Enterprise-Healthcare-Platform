import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { TasksService } from './tasks.service';
import { CompleteTaskDto, EscalateTaskDto, ListTasksQueryDto } from './dto/tasks.dto';

@ApiTags('Workflow Tasks')
@Controller('api/v1/workflow/tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'List my workflow tasks' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListTasksQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.tasksService.listMyTasks(ctx, filters, pagination.page, pagination.limit);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a workflow task' })
  complete(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteTaskDto,
  ) {
    return this.tasksService.complete(ctx, id, dto);
  }

  @Post(':id/escalate')
  @ApiOperation({ summary: 'Escalate an overdue workflow task' })
  escalate(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EscalateTaskDto,
  ) {
    return this.tasksService.escalate(ctx, id, dto);
  }
}
