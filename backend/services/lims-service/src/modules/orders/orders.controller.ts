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
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { LimsContext } from '@/common/decorators/lims.decorators';
import type { LimsRequestContext } from '@/common/context/lims-context';
import { CreateLabOrderDto, CancelOrderDto, ListOrdersQueryDto } from './dto/orders.dto';
import {
  CreateLabOrderCommand,
  CancelOrderCommand,
  GetOrderQuery,
  ListOrdersQuery,
} from './commands/orders.commands';

@ApiTags('Orders')
@Controller('api/v1/lims/orders')
export class OrdersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create lab order' })
  createOrder(@LimsContext() ctx: LimsRequestContext, @Body() dto: CreateLabOrderDto) {
    return this.commandBus.execute(new CreateLabOrderCommand(ctx, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List orders' })
  listOrders(
    @LimsContext() ctx: LimsRequestContext,
    @Query() filters: ListOrdersQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListOrdersQuery(ctx, { ...filters, page: pagination.page, limit: pagination.limit }),
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order detail' })
  getOrder(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetOrderQuery(ctx, id));
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel order' })
  cancelOrder(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelOrderDto,
  ) {
    return this.commandBus.execute(new CancelOrderCommand(ctx, id, dto));
  }
}
