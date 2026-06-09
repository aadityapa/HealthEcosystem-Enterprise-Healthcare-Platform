import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { OrdersService } from './orders.service';
import { B2BOrderDto, BookTestOrderDto, ListOrdersQueryDto } from './dto/orders.dto';

@ApiTags('Marketplace Orders')
@Controller('api/v1/marketplace/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('book')
  @ApiOperation({ summary: 'Book diagnostic test (B2C)' })
  bookTest(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: BookTestOrderDto) {
    return this.ordersService.bookTest(ctx, dto);
  }

  @Post('b2b')
  @ApiOperation({ summary: 'Create B2B partner order' })
  createB2B(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: B2BOrderDto) {
    return this.ordersService.createB2BOrder(ctx, dto);
  }

  @Get()
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListOrdersQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.ordersService.list(ctx, filters, pagination.page, pagination.limit);
  }

  @Get(':id')
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.getById(ctx, id);
  }
}
