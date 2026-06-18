import type { BillingRequestContext } from '@/common/context/billing-context';
import type {
  CreateRevenueShareRuleDto,
  CalculateSettlementDto,
  ListSettlementsQueryDto,
} from '../dto/franchise.dto';

export class CreateRevenueShareRuleCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly dto: CreateRevenueShareRuleDto,
  ) {}
}

export class CalculateSettlementCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly dto: CalculateSettlementDto,
  ) {}
}

export class ListRevenueShareRulesQuery {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly franchiseBranchId?: string,
  ) {}
}

export class ListSettlementsQuery {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly filters: ListSettlementsQueryDto,
  ) {}
}
