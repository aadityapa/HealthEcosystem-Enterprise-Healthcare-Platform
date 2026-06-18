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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ItemsService } from './items.service';
import {
  CreateInventoryItemDto,
  ListInventoryItemsDto,
  UpdateInventoryItemDto,
} from './dto/items.dto';

@ApiTags('Inventory Items')
@Controller('api/v1/inventory/items')
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Get()
  @ApiOperation({ summary: 'List inventory items' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: ListInventoryItemsDto) {
    return this.itemsService.list(ctx, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create inventory item' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateInventoryItemDto) {
    return this.itemsService.create(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get inventory item by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.itemsService.get(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update inventory item' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInventoryItemDto,
  ) {
    return this.itemsService.update(ctx, id, dto);
  }
}
