import type { MasterRequestContext } from '@/common/context/master-context';
import type { CreatePackageDto, UpdatePackageDto } from '../dto/packages.dto';

export class CreatePackageCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly dto: CreatePackageDto,
  ) {}
}

export class UpdatePackageCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly packageId: string,
    public readonly dto: UpdatePackageDto,
  ) {}
}

export class GetPackageQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly packageId: string,
  ) {}
}

export class ListPackagesQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly filters: { isActive?: boolean; page?: number; limit?: number },
  ) {}
}
