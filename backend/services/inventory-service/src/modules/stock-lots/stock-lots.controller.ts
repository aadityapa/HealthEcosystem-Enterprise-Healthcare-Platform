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
import { StockLotsService } from './stock-lots.service';
import {
  CreateStockLotDto,
  ExpiringLotsDto,
  ListStockLotsDto,
  UpdateStockLotDto,
} from './dto/stock-lots.dto';

@ApiTags('Stock Lots')
@Controller('api/v1/inventory/lots')
export class StockLotsController {
  constructor(private readonly stockLotsService: StockLotsService) {}

  @Get('expiring')
  @ApiOperation({ summary: 'List lots expiring within N days' })
  expiring(@ServiceContext() ctx: ServiceRequestContext, @Query() query: ExpiringLotsDto) {
    return this.stockLotsService.findExpiring(ctx, query);
  }

  @Get()
  @ApiOperation({ summary: 'List stock lots' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: ListStockLotsDto) {
    return this.stockLotsService.list(ctx, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create stock lot' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateStockLotDto) {
    return this.stockLotsService.create(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get stock lot by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.stockLotsService.get(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update stock lot' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockLotDto,
  ) {
    return this.stockLotsService.update(ctx, id, dto);
  }
}
