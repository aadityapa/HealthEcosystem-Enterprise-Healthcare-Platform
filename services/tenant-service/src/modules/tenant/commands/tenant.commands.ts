import type {
  CreateTenantDto,
  CreateOrganizationDto,
  CreateBranchDto,
  CreateDepartmentDto,
  CreateFranchiseAgreementDto,
} from '../dto/tenant.dto';

export class CreateTenantCommand {
  constructor(public readonly dto: CreateTenantDto) {}
}

export class CreateOrganizationCommand {
  constructor(public readonly dto: CreateOrganizationDto) {}
}

export class CreateBranchCommand {
  constructor(public readonly dto: CreateBranchDto) {}
}

export class CreateDepartmentCommand {
  constructor(public readonly dto: CreateDepartmentDto) {}
}

export class CreateFranchiseAgreementCommand {
  constructor(public readonly dto: CreateFranchiseAgreementDto) {}
}
