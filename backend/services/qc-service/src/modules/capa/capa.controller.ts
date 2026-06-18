import {
  Body,
  Controller,
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
import { CapaService } from './capa.service';
import { CreateCapaDto, ListCapaQueryDto, UpdateCapaDto } from './dto/capa.dto';

@ApiTags('QC CAPA')
@Controller('api/v1/qc/capa')
export class CapaController {
  constructor(private readonly capaService: CapaService) {}

  @Post()
  @ApiOperation({ summary: 'Create CAPA record from QC failure' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateCapaDto) {
    return this.capaService.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List CAPA records' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListCapaQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.capaService.list(ctx, filters, pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get CAPA record' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.capaService.getById(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update CAPA record' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCapaDto,
  ) {
    return this.capaService.update(ctx, id, dto);
  }
}
