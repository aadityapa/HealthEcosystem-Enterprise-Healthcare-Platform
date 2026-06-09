import type { MasterRequestContext } from '@/common/context/master-context';
import type { CreateSpecialtyDto, UpdateSpecialtyDto } from '../dto/specialties.dto';

export class CreateSpecialtyCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly dto: CreateSpecialtyDto,
  ) {}
}

export class UpdateSpecialtyCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly specialtyId: string,
    public readonly dto: UpdateSpecialtyDto,
  ) {}
}

export class GetSpecialtyQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly specialtyId: string,
  ) {}
}

export class ListSpecialtiesQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly filters: { isActive?: boolean; page?: number; limit?: number },
  ) {}
}
