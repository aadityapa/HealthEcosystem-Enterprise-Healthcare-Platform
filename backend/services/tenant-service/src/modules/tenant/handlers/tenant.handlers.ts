import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import type {
  Tenant,
  Organization,
  Branch,
  Department,
  FranchiseAgreement,
} from '@health/db';
import type { PaginationMeta } from '@health/shared-types';
import {
  CreateTenantCommand,
  CreateOrganizationCommand,
  CreateBranchCommand,
  CreateDepartmentCommand,
  CreateFranchiseAgreementCommand,
} from '../commands/tenant.commands';
import {
  GetTenantQuery,
  ListBranchesQuery,
  GetBranchTreeQuery,
} from '../queries/tenant.queries';
import type { BranchTreeNode, TenantDetailResponse } from '../dto/tenant.dto';
import { TenantService } from '../tenant.service';

@CommandHandler(CreateTenantCommand)
export class CreateTenantHandler implements ICommandHandler<CreateTenantCommand> {
  constructor(private readonly tenantService: TenantService) {}
  execute(command: CreateTenantCommand): Promise<Tenant> {
    return this.tenantService.createTenant(command.dto);
  }
}

@CommandHandler(CreateOrganizationCommand)
export class CreateOrganizationHandler implements ICommandHandler<CreateOrganizationCommand> {
  constructor(private readonly tenantService: TenantService) {}
  execute(command: CreateOrganizationCommand): Promise<Organization> {
    return this.tenantService.createOrganization(command.dto);
  }
}

@CommandHandler(CreateBranchCommand)
export class CreateBranchHandler implements ICommandHandler<CreateBranchCommand> {
  constructor(private readonly tenantService: TenantService) {}
  execute(command: CreateBranchCommand): Promise<Branch> {
    return this.tenantService.createBranch(command.dto);
  }
}

@CommandHandler(CreateDepartmentCommand)
export class CreateDepartmentHandler implements ICommandHandler<CreateDepartmentCommand> {
  constructor(private readonly tenantService: TenantService) {}
  execute(command: CreateDepartmentCommand): Promise<Department> {
    return this.tenantService.createDepartment(command.dto);
  }
}

@CommandHandler(CreateFranchiseAgreementCommand)
export class CreateFranchiseAgreementHandler
  implements ICommandHandler<CreateFranchiseAgreementCommand>
{
  constructor(private readonly tenantService: TenantService) {}
  execute(command: CreateFranchiseAgreementCommand): Promise<FranchiseAgreement> {
    return this.tenantService.createFranchiseAgreement(command.dto);
  }
}

@QueryHandler(GetTenantQuery)
export class GetTenantHandler implements IQueryHandler<GetTenantQuery> {
  constructor(private readonly tenantService: TenantService) {}
  execute(query: GetTenantQuery): Promise<TenantDetailResponse> {
    return this.tenantService.getTenant(query.identifier);
  }
}

@QueryHandler(ListBranchesQuery)
export class ListBranchesHandler implements IQueryHandler<ListBranchesQuery> {
  constructor(private readonly tenantService: TenantService) {}
  execute(query: ListBranchesQuery): Promise<{ items: Branch[]; meta: PaginationMeta }> {
    return this.tenantService.listBranches(query.query);
  }
}

@QueryHandler(GetBranchTreeQuery)
export class GetBranchTreeHandler implements IQueryHandler<GetBranchTreeQuery> {
  constructor(private readonly tenantService: TenantService) {}
  execute(query: GetBranchTreeQuery): Promise<BranchTreeNode[]> {
    return this.tenantService.getBranchTree(query.query);
  }
}
