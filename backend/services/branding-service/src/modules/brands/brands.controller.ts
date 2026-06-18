import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { BrandsService } from './brands.service';
import { CreateBrandDto, UpdateBrandDto } from './dto/brands.dto';

@ApiTags('Branding - Brands')
@Controller('api/v1/branding/brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Post()
  @ApiOperation({ summary: 'Create tenant brand' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateBrandDto) {
    return this.brandsService.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tenant brands' })
  list(@ServiceContext() ctx: ServiceRequestContext) {
    return this.brandsService.list(ctx);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant brand' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.getById(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant brand' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBrandDto,
  ) {
    return this.brandsService.update(ctx, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tenant brand' })
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.brandsService.remove(ctx, id);
  }
}
