import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { RoutesService } from './routes.service';
import { CreateRouteDto, ListRoutesDto, OptimizeRouteDto } from './dto/routes.dto';

@ApiTags('Field Routes')
@Controller('api/v1/field/routes')
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  @ApiOperation({ summary: 'List field routes' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: ListRoutesDto) {
    return this.routesService.list(ctx, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create field route with stops' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateRouteDto) {
    return this.routesService.create(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get route by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routesService.get(ctx, id);
  }

  @Post(':id/optimize')
  @ApiOperation({ summary: 'Optimize stop order via nearest-neighbor' })
  optimize(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OptimizeRouteDto,
  ) {
    return this.routesService.optimize(ctx, id, dto);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start route' })
  start(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routesService.start(ctx, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete route' })
  complete(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.routesService.complete(ctx, id);
  }
}
