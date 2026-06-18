import type { MasterRequestContext } from '@/common/context/master-context';

export class GetTestQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly testId: string,
  ) {}
}

export class ListTestsQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly filters: {
      categoryId?: string;
      search?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    },
  ) {}
}

export class ListCategoriesQuery {
  constructor(public readonly ctx: MasterRequestContext) {}
}

export class ListPricingQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly filters: { branchId?: string; testId?: string },
  ) {}
}
