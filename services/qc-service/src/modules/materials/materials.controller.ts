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
import { MaterialsService } from './materials.service';
import {
  CreateQcMaterialDto,
  ListMaterialsQueryDto,
  UpdateQcMaterialDto,
} from './dto/materials.dto';

@ApiTags('QC Materials')
@Controller('api/v1/qc/materials')
export class MaterialsController {
  constructor(private readonly materialsService: MaterialsService) {}

  @Post()
  @ApiOperation({ summary: 'Create QC material' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateQcMaterialDto) {
    return this.materialsService.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List QC materials' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListMaterialsQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.materialsService.list(ctx, filters, pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get QC material' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.materialsService.getById(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update QC material' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQcMaterialDto,
  ) {
    return this.materialsService.update(ctx, id, dto);
  }
}
