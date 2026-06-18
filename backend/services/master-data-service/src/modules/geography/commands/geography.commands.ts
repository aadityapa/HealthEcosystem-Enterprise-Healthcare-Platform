import type { MasterRequestContext } from '@/common/context/master-context';
import type {
  CreateStateDto,
  UpdateStateDto,
  CreateCityDto,
  UpdateCityDto,
} from '../dto/geography.dto';

export class SeedStatesCommand {
  constructor(public readonly ctx: MasterRequestContext) {}
}

export class CreateStateCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly dto: CreateStateDto,
  ) {}
}

export class UpdateStateCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly stateId: string,
    public readonly dto: UpdateStateDto,
  ) {}
}

export class CreateCityCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly dto: CreateCityDto,
  ) {}
}

export class UpdateCityCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly cityId: string,
    public readonly dto: UpdateCityDto,
  ) {}
}

export class ListStatesQuery {
  constructor(public readonly ctx: MasterRequestContext) {}
}

export class GetStateQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly stateId: string,
  ) {}
}

export class ListCitiesQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly filters: { stateId?: string; page?: number; limit?: number },
  ) {}
}

export class GetCityQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly cityId: string,
  ) {}
}
