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
import { ListDashboardsQueryDto } from '@/common/dto/analytics-query.dto';
import { DashboardsService } from './dashboards.service';
import { CreateDashboardDto, UpdateDashboardDto } from './dto/dashboards.dto';

@ApiTags('Analytics Dashboards')
@Controller('api/v1/analytics/dashboards')
export class DashboardsController {
  constructor(private readonly dashboardsService: DashboardsService) {}

  @Get()
  @ApiOperation({ summary: 'List dashboard configurations' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: ListDashboardsQueryDto,
  ) {
    return this.dashboardsService.list(ctx, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dashboard by id' })
  getById(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dashboardsService.getById(ctx, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create dashboard configuration' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateDashboardDto,
  ) {
    return this.dashboardsService.create(ctx, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update dashboard configuration' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDashboardDto,
  ) {
    return this.dashboardsService.update(ctx, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete dashboard configuration' })
  remove(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.dashboardsService.remove(ctx, id);
  }
}
