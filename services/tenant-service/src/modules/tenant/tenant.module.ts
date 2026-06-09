import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import {
  TenantController,
  OrganizationController,
  BranchController,
} from './tenant.controller';
import { TenantService } from './tenant.service';
import {
  CreateTenantHandler,
  CreateOrganizationHandler,
  CreateBranchHandler,
  CreateDepartmentHandler,
  CreateFranchiseAgreementHandler,
  GetTenantHandler,
  ListBranchesHandler,
  GetBranchTreeHandler,
} from './handlers/tenant.handlers';

const CommandHandlers = [
  CreateTenantHandler,
  CreateOrganizationHandler,
  CreateBranchHandler,
  CreateDepartmentHandler,
  CreateFranchiseAgreementHandler,
];

const QueryHandlers = [
  GetTenantHandler,
  ListBranchesHandler,
  GetBranchTreeHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [TenantController, OrganizationController, BranchController],
  providers: [TenantService, ...CommandHandlers, ...QueryHandlers],
  exports: [TenantService],
})
export class TenantModule {}
