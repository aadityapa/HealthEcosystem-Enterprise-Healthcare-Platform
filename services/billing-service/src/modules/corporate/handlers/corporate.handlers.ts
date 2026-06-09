import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CreateCorporateClientCommand,
  UpdateCorporateClientCommand,
  CreateCorporateContractCommand,
  UpsertCreditLimitCommand,
  GenerateStatementCommand,
  ListCorporateClientsQuery,
  ListCorporateContractsQuery,
  ListStatementsQuery,
} from '../commands/corporate.commands';
import { CorporateService } from '../corporate.service';

@CommandHandler(CreateCorporateClientCommand)
export class CreateCorporateClientHandler implements ICommandHandler<CreateCorporateClientCommand> {
  constructor(private readonly service: CorporateService) {}
  execute(cmd: CreateCorporateClientCommand) {
    return this.service.createClient(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdateCorporateClientCommand)
export class UpdateCorporateClientHandler implements ICommandHandler<UpdateCorporateClientCommand> {
  constructor(private readonly service: CorporateService) {}
  execute(cmd: UpdateCorporateClientCommand) {
    return this.service.updateClient(cmd.ctx, cmd.clientId, cmd.dto);
  }
}

@CommandHandler(CreateCorporateContractCommand)
export class CreateCorporateContractHandler implements ICommandHandler<CreateCorporateContractCommand> {
  constructor(private readonly service: CorporateService) {}
  execute(cmd: CreateCorporateContractCommand) {
    return this.service.createContract(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpsertCreditLimitCommand)
export class UpsertCreditLimitHandler implements ICommandHandler<UpsertCreditLimitCommand> {
  constructor(private readonly service: CorporateService) {}
  execute(cmd: UpsertCreditLimitCommand) {
    return this.service.upsertCreditLimit(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(GenerateStatementCommand)
export class GenerateStatementHandler implements ICommandHandler<GenerateStatementCommand> {
  constructor(private readonly service: CorporateService) {}
  execute(cmd: GenerateStatementCommand) {
    return this.service.generateStatement(cmd.ctx, cmd.dto);
  }
}

@QueryHandler(ListCorporateClientsQuery)
export class ListCorporateClientsHandler implements IQueryHandler<ListCorporateClientsQuery> {
  constructor(private readonly service: CorporateService) {}
  execute(query: ListCorporateClientsQuery) {
    return this.service.listClients(query.ctx);
  }
}

@QueryHandler(ListCorporateContractsQuery)
export class ListCorporateContractsHandler implements IQueryHandler<ListCorporateContractsQuery> {
  constructor(private readonly service: CorporateService) {}
  execute(query: ListCorporateContractsQuery) {
    return this.service.listContracts(query.ctx, query.corporateClientId);
  }
}

@QueryHandler(ListStatementsQuery)
export class ListStatementsHandler implements IQueryHandler<ListStatementsQuery> {
  constructor(private readonly service: CorporateService) {}
  execute(query: ListStatementsQuery) {
    return this.service.listStatements(query.ctx, query.corporateClientId);
  }
}

export const CorporateHandlers = [
  CreateCorporateClientHandler,
  UpdateCorporateClientHandler,
  CreateCorporateContractHandler,
  UpsertCreditLimitHandler,
  GenerateStatementHandler,
  ListCorporateClientsHandler,
  ListCorporateContractsHandler,
  ListStatementsHandler,
];
