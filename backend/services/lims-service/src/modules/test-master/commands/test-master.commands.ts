import type { LimsRequestContext } from '@/common/context/lims-context';
import type {
  CreateTestCategoryDto,
  UpdateTestCategoryDto,
  CreateTestDto,
  UpdateTestDto,
  CreateTestParameterDto,
  CreatePackageDto,
  UpdatePackageDto,
  CreatePricingDto,
  UpdatePricingDto,
} from '../dto/test-master.dto';

export class CreateTestCategoryCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly dto: CreateTestCategoryDto,
  ) {}
}

export class UpdateTestCategoryCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly categoryId: string,
    public readonly dto: UpdateTestCategoryDto,
  ) {}
}

export class CreateTestCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly dto: CreateTestDto,
  ) {}
}

export class UpdateTestCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly testId: string,
    public readonly dto: UpdateTestDto,
  ) {}
}

export class AddTestParameterCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly testId: string,
    public readonly dto: CreateTestParameterDto,
  ) {}
}

export class CreatePackageCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly dto: CreatePackageDto,
  ) {}
}

export class UpdatePackageCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly packageId: string,
    public readonly dto: UpdatePackageDto,
  ) {}
}

export class CreatePricingCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly dto: CreatePricingDto,
  ) {}
}

export class UpdatePricingCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly pricingId: string,
    public readonly dto: UpdatePricingDto,
  ) {}
}

export class GetTestQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly testId: string,
  ) {}
}

export class ListTestsQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
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
  constructor(public readonly ctx: LimsRequestContext) {}
}

export class GetPackageQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly packageId: string,
  ) {}
}

export class ListPackagesQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly filters: { isActive?: boolean; page?: number; limit?: number },
  ) {}
}

export class ListPricingQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly filters: { branchId?: string; testId?: string },
  ) {}
}
