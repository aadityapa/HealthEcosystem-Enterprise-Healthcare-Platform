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
import { StockTransfersService } from './stock-transfers.service';
import { CreateStockTransferDto, ListStockTransfersDto } from './dto/stock-transfers.dto';

@ApiTags('Stock Transfers')
@Controller('api/v1/inventory/transfers')
export class StockTransfersController {
  constructor(private readonly stockTransfersService: StockTransfersService) {}

  @Get()
  @ApiOperation({ summary: 'List stock transfers' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: ListStockTransfersDto) {
    return this.stockTransfersService.list(ctx, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create stock transfer' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateStockTransferDto) {
    return this.stockTransfersService.create(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock transfer by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.stockTransfersService.get(ctx, id);
  }

  @Post(':id/ship')
  @ApiOperation({ summary: 'Ship stock transfer from source branch' })
  ship(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.stockTransfersService.ship(ctx, id);
  }

  @Post(':id/receive')
  @ApiOperation({ summary: 'Receive stock transfer at destination branch' })
  receive(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.stockTransfersService.receive(ctx, id);
  }
}
