import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { WarehouseService } from './warehouse.service';
import {
  ListWarehouseTablesQueryDto,
  RefreshWarehouseDto,
} from './dto/warehouse.dto';

@ApiTags('Data Warehouse')
@Controller('api/v1/data/warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get('tables')
  @ApiOperation({ summary: 'List warehouse tables' })
  listTables(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: ListWarehouseTablesQueryDto,
  ) {
    return this.warehouseService.listTables(ctx, query);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Refresh warehouse tables (stub)' })
  refresh(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: RefreshWarehouseDto,
  ) {
    return this.warehouseService.refresh(ctx, dto);
  }
}
