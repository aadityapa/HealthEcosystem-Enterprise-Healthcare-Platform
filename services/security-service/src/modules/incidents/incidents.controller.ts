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
import { PaginationDto } from '@/common/dto/pagination.dto';
import { IncidentsService } from './incidents.service';
import { CreateIncidentDto, UpdateIncidentDto } from './dto/incidents.dto';

@ApiTags('Security Incidents')
@Controller('api/v1/security/incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  @ApiOperation({ summary: 'List security incidents' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: PaginationDto) {
    return this.incidentsService.list(ctx, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incident by id' })
  getById(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.incidentsService.getById(ctx, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create security incident' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateIncidentDto,
  ) {
    return this.incidentsService.create(ctx, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update security incident' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateIncidentDto,
  ) {
    return this.incidentsService.update(ctx, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete security incident' })
  remove(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.incidentsService.remove(ctx, id);
  }
}
