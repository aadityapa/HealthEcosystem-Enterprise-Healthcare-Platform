import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CreateRevenueShareRuleCommand,
  CalculateSettlementCommand,
  ListRevenueShareRulesQuery,
  ListSettlementsQuery,
} from '../commands/franchise.commands';
import { FranchiseSettlementService } from '../franchise-settlement.service';

@CommandHandler(CreateRevenueShareRuleCommand)
export class CreateRevenueShareRuleHandler implements ICommandHandler<CreateRevenueShareRuleCommand> {
  constructor(private readonly service: FranchiseSettlementService) {}
  execute(cmd: CreateRevenueShareRuleCommand) {
    return this.service.createRevenueShareRule(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(CalculateSettlementCommand)
export class CalculateSettlementHandler implements ICommandHandler<CalculateSettlementCommand> {
  constructor(private readonly service: FranchiseSettlementService) {}
  execute(cmd: CalculateSettlementCommand) {
    return this.service.calculateSettlement(cmd.ctx, cmd.dto);
  }
}

@QueryHandler(ListRevenueShareRulesQuery)
export class ListRevenueShareRulesHandler implements IQueryHandler<ListRevenueShareRulesQuery> {
  constructor(private readonly service: FranchiseSettlementService) {}
  execute(query: ListRevenueShareRulesQuery) {
    return this.service.listRevenueShareRules(query.ctx, query.franchiseBranchId);
  }
}

@QueryHandler(ListSettlementsQuery)
export class ListSettlementsHandler implements IQueryHandler<ListSettlementsQuery> {
  constructor(private readonly service: FranchiseSettlementService) {}
  execute(query: ListSettlementsQuery) {
    return this.service.listSettlements(query.ctx, query.filters);
  }
}

export const FranchiseHandlers = [
  CreateRevenueShareRuleHandler,
  CalculateSettlementHandler,
  ListRevenueShareRulesHandler,
  ListSettlementsHandler,
];
