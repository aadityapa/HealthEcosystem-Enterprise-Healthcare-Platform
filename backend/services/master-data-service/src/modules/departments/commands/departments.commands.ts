import type { MasterRequestContext } from '@/common/context/master-context';
import type { CreateDepartmentDto, UpdateDepartmentDto } from '../dto/departments.dto';

export class CreateDepartmentCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly dto: CreateDepartmentDto,
  ) {}
}

export class UpdateDepartmentCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly departmentId: string,
    public readonly dto: UpdateDepartmentDto,
  ) {}
}

export class GetDepartmentQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly departmentId: string,
  ) {}
}

export class ListDepartmentsQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly filters: {
      departmentType?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    },
  ) {}
}
