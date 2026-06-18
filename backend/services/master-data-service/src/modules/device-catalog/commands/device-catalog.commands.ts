import type { MasterRequestContext } from '@/common/context/master-context';
import type { CreateDeviceCatalogDto, UpdateDeviceCatalogDto } from '../dto/device-catalog.dto';

export class CreateDeviceCatalogCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly dto: CreateDeviceCatalogDto,
  ) {}
}

export class UpdateDeviceCatalogCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly catalogId: string,
    public readonly dto: UpdateDeviceCatalogDto,
  ) {}
}

export class GetDeviceCatalogQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly catalogId: string,
  ) {}
}

export class ListDeviceCatalogQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly filters: {
      vendor?: string;
      deviceType?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    },
  ) {}
}
