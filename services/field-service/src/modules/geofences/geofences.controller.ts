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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { GeofencesService } from './geofences.service';
import {
  CreateGeoFenceDto,
  ListGeoFencesDto,
  UpdateGeoFenceDto,
} from './dto/geofences.dto';

@ApiTags('Geofences')
@Controller('api/v1/field/geofences')
export class GeofencesController {
  constructor(private readonly geofencesService: GeofencesService) {}

  @Get()
  @ApiOperation({ summary: 'List geofences' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: ListGeoFencesDto) {
    return this.geofencesService.list(ctx, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create geofence' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateGeoFenceDto) {
    return this.geofencesService.create(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get geofence by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.geofencesService.get(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update geofence' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGeoFenceDto,
  ) {
    return this.geofencesService.update(ctx, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate geofence' })
  remove(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.geofencesService.remove(ctx, id);
  }
}
