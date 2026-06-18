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
import { ListingsService } from './listings.service';
import {
  CreateListingDto,
  ListListingsQueryDto,
  UpdateListingDto,
} from './dto/listings.dto';

@ApiTags('Marketplace Listings')
@Controller('api/v1/marketplace/listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Post()
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateListingDto) {
    return this.listingsService.create(ctx, dto);
  }

  @Get()
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListListingsQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.listingsService.list(ctx, filters, pagination.page, pagination.limit);
  }

  @Get(':id')
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.listingsService.getById(ctx, id);
  }

  @Patch(':id')
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateListingDto,
  ) {
    return this.listingsService.update(ctx, id, dto);
  }

  @Delete(':id')
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.listingsService.remove(ctx, id);
  }
}
