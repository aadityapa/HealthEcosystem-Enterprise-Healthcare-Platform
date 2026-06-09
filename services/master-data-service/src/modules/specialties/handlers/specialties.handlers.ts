import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CreateSpecialtyCommand,
  UpdateSpecialtyCommand,
  GetSpecialtyQuery,
  ListSpecialtiesQuery,
} from '../commands/specialties.commands';
import { SpecialtiesService } from '../specialties.service';

@CommandHandler(CreateSpecialtyCommand)
export class CreateSpecialtyHandler implements ICommandHandler<CreateSpecialtyCommand> {
  constructor(private readonly service: SpecialtiesService) {}
  execute(cmd: CreateSpecialtyCommand) {
    return this.service.create(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdateSpecialtyCommand)
export class UpdateSpecialtyHandler implements ICommandHandler<UpdateSpecialtyCommand> {
  constructor(private readonly service: SpecialtiesService) {}
  execute(cmd: UpdateSpecialtyCommand) {
    return this.service.update(cmd.ctx, cmd.specialtyId, cmd.dto);
  }
}

@QueryHandler(GetSpecialtyQuery)
export class GetSpecialtyHandler implements IQueryHandler<GetSpecialtyQuery> {
  constructor(private readonly service: SpecialtiesService) {}
  execute(query: GetSpecialtyQuery) {
    return this.service.get(query.ctx, query.specialtyId);
  }
}

@QueryHandler(ListSpecialtiesQuery)
export class ListSpecialtiesHandler implements IQueryHandler<ListSpecialtiesQuery> {
  constructor(private readonly service: SpecialtiesService) {}
  execute(query: ListSpecialtiesQuery) {
    return this.service.list(query.ctx, query.filters);
  }
}

export const SpecialtiesHandlers = [
  CreateSpecialtyHandler,
  UpdateSpecialtyHandler,
  GetSpecialtyHandler,
  ListSpecialtiesHandler,
];
