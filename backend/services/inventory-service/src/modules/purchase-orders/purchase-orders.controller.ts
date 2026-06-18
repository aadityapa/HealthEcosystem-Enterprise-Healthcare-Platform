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
import { PurchaseOrdersService } from './purchase-orders.service';
import {
  CreatePurchaseOrderDto,
  ListPurchaseOrdersDto,
  ReceivePurchaseOrderLineDto,
} from './dto/purchase-orders.dto';

@ApiTags('Purchase Orders')
@Controller('api/v1/inventory/purchase-orders')
export class PurchaseOrdersController {
  constructor(private readonly purchaseOrdersService: PurchaseOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List purchase orders' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: ListPurchaseOrdersDto) {
    return this.purchaseOrdersService.list(ctx, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create purchase order' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreatePurchaseOrderDto) {
    return this.purchaseOrdersService.create(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get purchase order by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.purchaseOrdersService.get(ctx, id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve purchase order' })
  approve(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.purchaseOrdersService.approve(ctx, id);
  }

  @Post(':id/lines/:lineId/receive')
  @ApiOperation({ summary: 'Receive purchase order line items into stock' })
  receiveLine(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('lineId', ParseUUIDPipe) lineId: string,
    @Body() dto: ReceivePurchaseOrderLineDto,
  ) {
    return this.purchaseOrdersService.receiveLine(ctx, id, lineId, dto);
  }
}
