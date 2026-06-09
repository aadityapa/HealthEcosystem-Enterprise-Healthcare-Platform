import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CreateTaxCommand,
  UpdateTaxCommand,
  GetTaxQuery,
  ListTaxQuery,
} from '../commands/tax.commands';
import { TaxService } from '../tax.service';

@CommandHandler(CreateTaxCommand)
export class CreateTaxHandler implements ICommandHandler<CreateTaxCommand> {
  constructor(private readonly service: TaxService) {}
  execute(cmd: CreateTaxCommand) {
    return this.service.create(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdateTaxCommand)
export class UpdateTaxHandler implements ICommandHandler<UpdateTaxCommand> {
  constructor(private readonly service: TaxService) {}
  execute(cmd: UpdateTaxCommand) {
    return this.service.update(cmd.ctx, cmd.taxId, cmd.dto);
  }
}

@QueryHandler(GetTaxQuery)
export class GetTaxHandler implements IQueryHandler<GetTaxQuery> {
  constructor(private readonly service: TaxService) {}
  execute(query: GetTaxQuery) {
    return this.service.get(query.ctx, query.taxId);
  }
}

@QueryHandler(ListTaxQuery)
export class ListTaxHandler implements IQueryHandler<ListTaxQuery> {
  constructor(private readonly service: TaxService) {}
  execute(query: ListTaxQuery) {
    return this.service.list(query.ctx, query.filters);
  }
}

export const TaxHandlers = [
  CreateTaxHandler,
  UpdateTaxHandler,
  GetTaxHandler,
  ListTaxHandler,
];
