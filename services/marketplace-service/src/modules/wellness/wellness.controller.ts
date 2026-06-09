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
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { WellnessService } from './wellness.service';
import { CreateWellnessPackageDto, UpdateWellnessPackageDto } from './dto/wellness.dto';

@ApiTags('Marketplace Wellness')
@Controller('api/v1/marketplace/wellness')
export class WellnessController {
  constructor(private readonly wellnessService: WellnessService) {}

  @Post()
  @ApiOperation({ summary: 'Create corporate wellness package' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateWellnessPackageDto) {
    return this.wellnessService.create(ctx, dto);
  }

  @Get()
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() pagination: PaginationDto) {
    return this.wellnessService.list(ctx, pagination.page, pagination.limit);
  }

  @Get(':id')
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.wellnessService.getById(ctx, id);
  }

  @Patch(':id')
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWellnessPackageDto,
  ) {
    return this.wellnessService.update(ctx, id, dto);
  }

  @Delete(':id')
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.wellnessService.remove(ctx, id);
  }
}
