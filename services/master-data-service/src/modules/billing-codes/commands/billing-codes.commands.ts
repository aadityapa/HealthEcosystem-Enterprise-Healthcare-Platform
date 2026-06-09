import type { MasterRequestContext } from '@/common/context/master-context';
import type { CreateBillingCodeDto, UpdateBillingCodeDto } from '../dto/billing-codes.dto';

export class CreateBillingCodeCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly dto: CreateBillingCodeDto,
  ) {}
}

export class UpdateBillingCodeCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly billingCodeId: string,
    public readonly dto: UpdateBillingCodeDto,
  ) {}
}

export class GetBillingCodeQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly billingCodeId: string,
  ) {}
}

export class ListBillingCodesQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly filters: { codeType?: string; isActive?: boolean; page?: number; limit?: number },
  ) {}
}
