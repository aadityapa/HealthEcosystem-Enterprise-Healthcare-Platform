import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CreateTestCategoryCommand,
  UpdateTestCategoryCommand,
  CreateTestCommand,
  UpdateTestCommand,
  AddTestParameterCommand,
  CreatePackageCommand,
  UpdatePackageCommand,
  CreatePricingCommand,
  UpdatePricingCommand,
  GetTestQuery,
  ListTestsQuery,
  ListCategoriesQuery,
  GetPackageQuery,
  ListPackagesQuery,
  ListPricingQuery,
} from '../commands/test-master.commands';
import { TestMasterService } from '../test-master.service';

@CommandHandler(CreateTestCategoryCommand)
export class CreateTestCategoryHandler implements ICommandHandler<CreateTestCategoryCommand> {
  constructor(private readonly service: TestMasterService) {}
  execute(cmd: CreateTestCategoryCommand) {
    return this.service.createCategory(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdateTestCategoryCommand)
export class UpdateTestCategoryHandler implements ICommandHandler<UpdateTestCategoryCommand> {
  constructor(private readonly service: TestMasterService) {}
  execute(cmd: UpdateTestCategoryCommand) {
    return this.service.updateCategory(cmd.ctx, cmd.categoryId, cmd.dto);
  }
}

@CommandHandler(CreateTestCommand)
export class CreateTestHandler implements ICommandHandler<CreateTestCommand> {
  constructor(private readonly service: TestMasterService) {}
  execute(cmd: CreateTestCommand) {
    return this.service.createTest(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdateTestCommand)
export class UpdateTestHandler implements ICommandHandler<UpdateTestCommand> {
  constructor(private readonly service: TestMasterService) {}
  execute(cmd: UpdateTestCommand) {
    return this.service.updateTest(cmd.ctx, cmd.testId, cmd.dto);
  }
}

@CommandHandler(AddTestParameterCommand)
export class AddTestParameterHandler implements ICommandHandler<AddTestParameterCommand> {
  constructor(private readonly service: TestMasterService) {}
  execute(cmd: AddTestParameterCommand) {
    return this.service.addParameter(cmd.ctx, cmd.testId, cmd.dto);
  }
}

@CommandHandler(CreatePackageCommand)
export class CreatePackageHandler implements ICommandHandler<CreatePackageCommand> {
  constructor(private readonly service: TestMasterService) {}
  execute(cmd: CreatePackageCommand) {
    return this.service.createPackage(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdatePackageCommand)
export class UpdatePackageHandler implements ICommandHandler<UpdatePackageCommand> {
  constructor(private readonly service: TestMasterService) {}
  execute(cmd: UpdatePackageCommand) {
    return this.service.updatePackage(cmd.ctx, cmd.packageId, cmd.dto);
  }
}

@CommandHandler(CreatePricingCommand)
export class CreatePricingHandler implements ICommandHandler<CreatePricingCommand> {
  constructor(private readonly service: TestMasterService) {}
  execute(cmd: CreatePricingCommand) {
    return this.service.createPricing(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdatePricingCommand)
export class UpdatePricingHandler implements ICommandHandler<UpdatePricingCommand> {
  constructor(private readonly service: TestMasterService) {}
  execute(cmd: UpdatePricingCommand) {
    return this.service.updatePricing(cmd.ctx, cmd.pricingId, cmd.dto);
  }
}

@QueryHandler(GetTestQuery)
export class GetTestHandler implements IQueryHandler<GetTestQuery> {
  constructor(private readonly service: TestMasterService) {}
  execute(query: GetTestQuery) {
    return this.service.getTest(query.ctx, query.testId);
  }
}

@QueryHandler(ListTestsQuery)
export class ListTestsHandler implements IQueryHandler<ListTestsQuery> {
  constructor(private readonly service: TestMasterService) {}
  execute(query: ListTestsQuery) {
    return this.service.listTests(query.ctx, query.filters);
  }
}

@QueryHandler(ListCategoriesQuery)
export class ListCategoriesHandler implements IQueryHandler<ListCategoriesQuery> {
  constructor(private readonly service: TestMasterService) {}
  execute(query: ListCategoriesQuery) {
    return this.service.listCategories(query.ctx);
  }
}

@QueryHandler(GetPackageQuery)
export class GetPackageHandler implements IQueryHandler<GetPackageQuery> {
  constructor(private readonly service: TestMasterService) {}
  execute(query: GetPackageQuery) {
    return this.service.getPackage(query.ctx, query.packageId);
  }
}

@QueryHandler(ListPackagesQuery)
export class ListPackagesHandler implements IQueryHandler<ListPackagesQuery> {
  constructor(private readonly service: TestMasterService) {}
  execute(query: ListPackagesQuery) {
    return this.service.listPackages(query.ctx, query.filters);
  }
}

@QueryHandler(ListPricingQuery)
export class ListPricingHandler implements IQueryHandler<ListPricingQuery> {
  constructor(private readonly service: TestMasterService) {}
  execute(query: ListPricingQuery) {
    return this.service.listPricing(query.ctx, query.filters);
  }
}

export const TestMasterHandlers = [
  CreateTestCategoryHandler,
  UpdateTestCategoryHandler,
  CreateTestHandler,
  UpdateTestHandler,
  AddTestParameterHandler,
  CreatePackageHandler,
  UpdatePackageHandler,
  CreatePricingHandler,
  UpdatePricingHandler,
  GetTestHandler,
  ListTestsHandler,
  ListCategoriesHandler,
  GetPackageHandler,
  ListPackagesHandler,
  ListPricingHandler,
];
