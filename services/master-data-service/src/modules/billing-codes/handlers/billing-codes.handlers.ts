import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CreateBillingCodeCommand,
  UpdateBillingCodeCommand,
  GetBillingCodeQuery,
  ListBillingCodesQuery,
} from '../commands/billing-codes.commands';
import { BillingCodesService } from '../billing-codes.service';

@CommandHandler(CreateBillingCodeCommand)
export class CreateBillingCodeHandler implements ICommandHandler<CreateBillingCodeCommand> {
  constructor(private readonly service: BillingCodesService) {}
  execute(cmd: CreateBillingCodeCommand) {
    return this.service.create(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdateBillingCodeCommand)
export class UpdateBillingCodeHandler implements ICommandHandler<UpdateBillingCodeCommand> {
  constructor(private readonly service: BillingCodesService) {}
  execute(cmd: UpdateBillingCodeCommand) {
    return this.service.update(cmd.ctx, cmd.billingCodeId, cmd.dto);
  }
}

@QueryHandler(GetBillingCodeQuery)
export class GetBillingCodeHandler implements IQueryHandler<GetBillingCodeQuery> {
  constructor(private readonly service: BillingCodesService) {}
  execute(query: GetBillingCodeQuery) {
    return this.service.get(query.ctx, query.billingCodeId);
  }
}

@QueryHandler(ListBillingCodesQuery)
export class ListBillingCodesHandler implements IQueryHandler<ListBillingCodesQuery> {
  constructor(private readonly service: BillingCodesService) {}
  execute(query: ListBillingCodesQuery) {
    return this.service.list(query.ctx, query.filters);
  }
}

export const BillingCodesHandlers = [
  CreateBillingCodeHandler,
  UpdateBillingCodeHandler,
  GetBillingCodeHandler,
  ListBillingCodesHandler,
];
