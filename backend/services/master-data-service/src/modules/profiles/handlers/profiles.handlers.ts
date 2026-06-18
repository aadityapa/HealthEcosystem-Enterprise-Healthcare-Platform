import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CreateProfileCommand,
  UpdateProfileCommand,
  GetProfileQuery,
  ListProfilesQuery,
} from '../commands/profiles.commands';
import { ProfilesService } from '../profiles.service';

@CommandHandler(CreateProfileCommand)
export class CreateProfileHandler implements ICommandHandler<CreateProfileCommand> {
  constructor(private readonly service: ProfilesService) {}
  execute(cmd: CreateProfileCommand) {
    return this.service.create(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdateProfileCommand)
export class UpdateProfileHandler implements ICommandHandler<UpdateProfileCommand> {
  constructor(private readonly service: ProfilesService) {}
  execute(cmd: UpdateProfileCommand) {
    return this.service.update(cmd.ctx, cmd.profileId, cmd.dto);
  }
}

@QueryHandler(GetProfileQuery)
export class GetProfileHandler implements IQueryHandler<GetProfileQuery> {
  constructor(private readonly service: ProfilesService) {}
  execute(query: GetProfileQuery) {
    return this.service.get(query.ctx, query.profileId);
  }
}

@QueryHandler(ListProfilesQuery)
export class ListProfilesHandler implements IQueryHandler<ListProfilesQuery> {
  constructor(private readonly service: ProfilesService) {}
  execute(query: ListProfilesQuery) {
    return this.service.list(query.ctx, query.filters);
  }
}

export const ProfilesHandlers = [
  CreateProfileHandler,
  UpdateProfileHandler,
  GetProfileHandler,
  ListProfilesHandler,
];
