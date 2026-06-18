import type { BillingRequestContext } from '@/common/context/billing-context';
import type {
  CreateCorporateClientDto,
  CreateCorporateContractDto,
  UpsertCreditLimitDto,
  GenerateStatementDto,
  UpdateCorporateClientDto,
} from '../dto/corporate.dto';

export class CreateCorporateClientCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly dto: CreateCorporateClientDto,
  ) {}
}

export class UpdateCorporateClientCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly clientId: string,
    public readonly dto: UpdateCorporateClientDto,
  ) {}
}

export class CreateCorporateContractCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly dto: CreateCorporateContractDto,
  ) {}
}

export class UpsertCreditLimitCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly dto: UpsertCreditLimitDto,
  ) {}
}

export class GenerateStatementCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly dto: GenerateStatementDto,
  ) {}
}

export class ListCorporateClientsQuery {
  constructor(public readonly ctx: BillingRequestContext) {}
}

export class ListCorporateContractsQuery {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly corporateClientId?: string,
  ) {}
}

export class ListStatementsQuery {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly corporateClientId?: string,
  ) {}
}
