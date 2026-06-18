import type { MasterRequestContext } from '@/common/context/master-context';
import type {
  CreateTestCategoryDto,
  UpdateTestCategoryDto,
  CreateTestDto,
  UpdateTestDto,
  CreateTestParameterDto,
  CreatePricingDto,
  UpdatePricingDto,
} from '../dto/tests.dto';

export class CreateTestCategoryCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly dto: CreateTestCategoryDto,
  ) {}
}

export class UpdateTestCategoryCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly categoryId: string,
    public readonly dto: UpdateTestCategoryDto,
  ) {}
}

export class CreateTestCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly dto: CreateTestDto,
  ) {}
}

export class UpdateTestCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly testId: string,
    public readonly dto: UpdateTestDto,
  ) {}
}

export class AddTestParameterCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly testId: string,
    public readonly dto: CreateTestParameterDto,
  ) {}
}

export class CreatePricingCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly dto: CreatePricingDto,
  ) {}
}

export class UpdatePricingCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly pricingId: string,
    public readonly dto: UpdatePricingDto,
  ) {}
}
