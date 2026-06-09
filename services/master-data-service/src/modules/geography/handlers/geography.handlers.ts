import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  SeedStatesCommand,
  CreateStateCommand,
  UpdateStateCommand,
  CreateCityCommand,
  UpdateCityCommand,
  ListStatesQuery,
  GetStateQuery,
  ListCitiesQuery,
  GetCityQuery,
} from '../commands/geography.commands';
import { GeographyService } from '../geography.service';

@CommandHandler(SeedStatesCommand)
export class SeedStatesHandler implements ICommandHandler<SeedStatesCommand> {
  constructor(private readonly service: GeographyService) {}
  execute(cmd: SeedStatesCommand) {
    return this.service.seedIndianStates(cmd.ctx);
  }
}

@CommandHandler(CreateStateCommand)
export class CreateStateHandler implements ICommandHandler<CreateStateCommand> {
  constructor(private readonly service: GeographyService) {}
  execute(cmd: CreateStateCommand) {
    return this.service.createState(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdateStateCommand)
export class UpdateStateHandler implements ICommandHandler<UpdateStateCommand> {
  constructor(private readonly service: GeographyService) {}
  execute(cmd: UpdateStateCommand) {
    return this.service.updateState(cmd.ctx, cmd.stateId, cmd.dto);
  }
}

@CommandHandler(CreateCityCommand)
export class CreateCityHandler implements ICommandHandler<CreateCityCommand> {
  constructor(private readonly service: GeographyService) {}
  execute(cmd: CreateCityCommand) {
    return this.service.createCity(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdateCityCommand)
export class UpdateCityHandler implements ICommandHandler<UpdateCityCommand> {
  constructor(private readonly service: GeographyService) {}
  execute(cmd: UpdateCityCommand) {
    return this.service.updateCity(cmd.ctx, cmd.cityId, cmd.dto);
  }
}

@QueryHandler(ListStatesQuery)
export class ListStatesHandler implements IQueryHandler<ListStatesQuery> {
  constructor(private readonly service: GeographyService) {}
  execute() {
    return this.service.listStates();
  }
}

@QueryHandler(GetStateQuery)
export class GetStateHandler implements IQueryHandler<GetStateQuery> {
  constructor(private readonly service: GeographyService) {}
  execute(query: GetStateQuery) {
    return this.service.getState(query.stateId);
  }
}

@QueryHandler(ListCitiesQuery)
export class ListCitiesHandler implements IQueryHandler<ListCitiesQuery> {
  constructor(private readonly service: GeographyService) {}
  execute(query: ListCitiesQuery) {
    return this.service.listCities(query.filters);
  }
}

@QueryHandler(GetCityQuery)
export class GetCityHandler implements IQueryHandler<GetCityQuery> {
  constructor(private readonly service: GeographyService) {}
  execute(query: GetCityQuery) {
    return this.service.getCity(query.cityId);
  }
}

export const GeographyHandlers = [
  SeedStatesHandler,
  CreateStateHandler,
  UpdateStateHandler,
  CreateCityHandler,
  UpdateCityHandler,
  ListStatesHandler,
  GetStateHandler,
  ListCitiesHandler,
  GetCityHandler,
];
