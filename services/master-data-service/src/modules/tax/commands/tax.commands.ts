import type { MasterRequestContext } from '@/common/context/master-context';
import type { CreateTaxDto, UpdateTaxDto } from '../dto/tax.dto';

export class CreateTaxCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly dto: CreateTaxDto,
  ) {}
}

export class UpdateTaxCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly taxId: string,
    public readonly dto: UpdateTaxDto,
  ) {}
}

export class GetTaxQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly taxId: string,
  ) {}
}

export class ListTaxQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly filters: { isActive?: boolean; page?: number; limit?: number },
  ) {}
}
