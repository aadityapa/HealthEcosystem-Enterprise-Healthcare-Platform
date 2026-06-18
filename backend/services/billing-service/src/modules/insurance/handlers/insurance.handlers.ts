import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CreateInsuranceTPACommand,
  CreateInsuranceClaimCommand,
  SubmitClaimCommand,
  UpdateClaimStatusCommand,
  ReconcileClaimCommand,
  ListInsuranceTPAsQuery,
  ListInsuranceClaimsQuery,
  GetInsuranceClaimQuery,
} from '../commands/insurance.commands';
import { InsuranceService } from '../insurance.service';

@CommandHandler(CreateInsuranceTPACommand)
export class CreateInsuranceTPAHandler implements ICommandHandler<CreateInsuranceTPACommand> {
  constructor(private readonly service: InsuranceService) {}
  execute(cmd: CreateInsuranceTPACommand) {
    return this.service.createTPA(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(CreateInsuranceClaimCommand)
export class CreateInsuranceClaimHandler implements ICommandHandler<CreateInsuranceClaimCommand> {
  constructor(private readonly service: InsuranceService) {}
  execute(cmd: CreateInsuranceClaimCommand) {
    return this.service.createClaim(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(SubmitClaimCommand)
export class SubmitClaimHandler implements ICommandHandler<SubmitClaimCommand> {
  constructor(private readonly service: InsuranceService) {}
  execute(cmd: SubmitClaimCommand) {
    return this.service.submitClaim(cmd.ctx, cmd.claimId);
  }
}

@CommandHandler(UpdateClaimStatusCommand)
export class UpdateClaimStatusHandler implements ICommandHandler<UpdateClaimStatusCommand> {
  constructor(private readonly service: InsuranceService) {}
  execute(cmd: UpdateClaimStatusCommand) {
    return this.service.updateClaimStatus(cmd.ctx, cmd.claimId, cmd.dto);
  }
}

@CommandHandler(ReconcileClaimCommand)
export class ReconcileClaimHandler implements ICommandHandler<ReconcileClaimCommand> {
  constructor(private readonly service: InsuranceService) {}
  execute(cmd: ReconcileClaimCommand) {
    return this.service.reconcileClaim(cmd.ctx, cmd.claimId, cmd.dto);
  }
}

@QueryHandler(ListInsuranceTPAsQuery)
export class ListInsuranceTPAsHandler implements IQueryHandler<ListInsuranceTPAsQuery> {
  constructor(private readonly service: InsuranceService) {}
  execute(query: ListInsuranceTPAsQuery) {
    return this.service.listTPAs(query.ctx);
  }
}

@QueryHandler(ListInsuranceClaimsQuery)
export class ListInsuranceClaimsHandler implements IQueryHandler<ListInsuranceClaimsQuery> {
  constructor(private readonly service: InsuranceService) {}
  execute(query: ListInsuranceClaimsQuery) {
    return this.service.listClaims(query.ctx, query.filters);
  }
}

@QueryHandler(GetInsuranceClaimQuery)
export class GetInsuranceClaimHandler implements IQueryHandler<GetInsuranceClaimQuery> {
  constructor(private readonly service: InsuranceService) {}
  execute(query: GetInsuranceClaimQuery) {
    return this.service.getClaim(query.ctx, query.claimId);
  }
}

export const InsuranceHandlers = [
  CreateInsuranceTPAHandler,
  CreateInsuranceClaimHandler,
  SubmitClaimHandler,
  UpdateClaimStatusHandler,
  ReconcileClaimHandler,
  ListInsuranceTPAsHandler,
  ListInsuranceClaimsHandler,
  GetInsuranceClaimHandler,
];
