import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ViewsService } from './views.service';
import {
  CreateMaterializedViewDto,
  RefreshMaterializedViewDto,
} from './dto/views.dto';

@ApiTags('Analytics Views')
@Controller('api/v1/analytics/views')
export class ViewsController {
  constructor(private readonly viewsService: ViewsService) {}

  @Get()
  @ApiOperation({ summary: 'List registered materialized views' })
  list(@ServiceContext() ctx: ServiceRequestContext) {
    return this.viewsService.list(ctx);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a materialized view' })
  register(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateMaterializedViewDto,
  ) {
    return this.viewsService.register(ctx, dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger materialized view refresh metadata update' })
  refresh(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: RefreshMaterializedViewDto,
  ) {
    return this.viewsService.refresh(ctx, dto);
  }
}
