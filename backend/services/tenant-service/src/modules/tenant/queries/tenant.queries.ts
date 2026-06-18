import type { ListBranchesQueryDto, GetBranchTreeQueryDto } from '../dto/tenant.dto';

export class GetTenantQuery {
  constructor(public readonly identifier: string) {}
}

export class ListBranchesQuery {
  constructor(public readonly query: ListBranchesQueryDto) {}
}

export class GetBranchTreeQuery {
  constructor(public readonly query: GetBranchTreeQueryDto) {}
}
