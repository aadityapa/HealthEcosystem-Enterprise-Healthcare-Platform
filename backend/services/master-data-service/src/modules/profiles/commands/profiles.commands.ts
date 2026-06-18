import type { MasterRequestContext } from '@/common/context/master-context';
import type { CreateProfileDto, UpdateProfileDto } from '../dto/profiles.dto';

export class CreateProfileCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly dto: CreateProfileDto,
  ) {}
}

export class UpdateProfileCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly profileId: string,
    public readonly dto: UpdateProfileDto,
  ) {}
}

export class GetProfileQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly profileId: string,
  ) {}
}

export class ListProfilesQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly filters: { isActive?: boolean; page?: number; limit?: number },
  ) {}
}
