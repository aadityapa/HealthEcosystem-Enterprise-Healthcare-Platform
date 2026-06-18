import type { LimsRequestContext } from '@/common/context/lims-context';
import type { CreateLabOrderDto, CancelOrderDto } from '../dto/orders.dto';

export class CreateLabOrderCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly dto: CreateLabOrderDto,
  ) {}
}

export class CancelOrderCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly orderId: string,
    public readonly dto: CancelOrderDto,
  ) {}
}

export class GetOrderQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly orderId: string,
  ) {}
}

export class ListOrdersQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly filters: {
      patientId?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {}
}
