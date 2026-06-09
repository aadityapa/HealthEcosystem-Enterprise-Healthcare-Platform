import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CreateLabOrderCommand,
  CancelOrderCommand,
  GetOrderQuery,
  ListOrdersQuery,
} from '../commands/orders.commands';
import { OrdersService } from '../orders.service';

@CommandHandler(CreateLabOrderCommand)
export class CreateLabOrderHandler implements ICommandHandler<CreateLabOrderCommand> {
  constructor(private readonly service: OrdersService) {}
  execute(cmd: CreateLabOrderCommand) {
    return this.service.createOrder(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(CancelOrderCommand)
export class CancelOrderHandler implements ICommandHandler<CancelOrderCommand> {
  constructor(private readonly service: OrdersService) {}
  execute(cmd: CancelOrderCommand) {
    return this.service.cancelOrder(cmd.ctx, cmd.orderId, cmd.dto.reason);
  }
}

@QueryHandler(GetOrderQuery)
export class GetOrderHandler implements IQueryHandler<GetOrderQuery> {
  constructor(private readonly service: OrdersService) {}
  execute(query: GetOrderQuery) {
    return this.service.getOrder(query.ctx, query.orderId);
  }
}

@QueryHandler(ListOrdersQuery)
export class ListOrdersHandler implements IQueryHandler<ListOrdersQuery> {
  constructor(private readonly service: OrdersService) {}
  execute(query: ListOrdersQuery) {
    return this.service.listOrders(query.ctx, query.filters);
  }
}

export const OrderHandlers = [
  CreateLabOrderHandler,
  CancelOrderHandler,
  GetOrderHandler,
  ListOrdersHandler,
];
