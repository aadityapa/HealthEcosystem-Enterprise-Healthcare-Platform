import type { BillingRequestContext } from '@/common/context/billing-context';
import type {
  CreateInsuranceTPADto,
  CreateInsuranceClaimDto,
  UpdateClaimStatusDto,
  ReconcileClaimDto,
} from '../dto/insurance.dto';

export class CreateInsuranceTPACommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly dto: CreateInsuranceTPADto,
  ) {}
}

export class CreateInsuranceClaimCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly dto: CreateInsuranceClaimDto,
  ) {}
}

export class SubmitClaimCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly claimId: string,
  ) {}
}

export class UpdateClaimStatusCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly claimId: string,
    public readonly dto: UpdateClaimStatusDto,
  ) {}
}

export class ReconcileClaimCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly claimId: string,
    public readonly dto: ReconcileClaimDto,
  ) {}
}

export class ListInsuranceTPAsQuery {
  constructor(public readonly ctx: BillingRequestContext) {}
}

export class ListInsuranceClaimsQuery {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly filters: { status?: string; tpaId?: string },
  ) {}
}

export class GetInsuranceClaimQuery {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly claimId: string,
  ) {}
}
