import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CreateDeviceCatalogCommand,
  UpdateDeviceCatalogCommand,
  GetDeviceCatalogQuery,
  ListDeviceCatalogQuery,
} from '../commands/device-catalog.commands';
import { DeviceCatalogService } from '../device-catalog.service';

@CommandHandler(CreateDeviceCatalogCommand)
export class CreateDeviceCatalogHandler implements ICommandHandler<CreateDeviceCatalogCommand> {
  constructor(private readonly service: DeviceCatalogService) {}
  execute(cmd: CreateDeviceCatalogCommand) {
    return this.service.create(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdateDeviceCatalogCommand)
export class UpdateDeviceCatalogHandler implements ICommandHandler<UpdateDeviceCatalogCommand> {
  constructor(private readonly service: DeviceCatalogService) {}
  execute(cmd: UpdateDeviceCatalogCommand) {
    return this.service.update(cmd.ctx, cmd.catalogId, cmd.dto);
  }
}

@QueryHandler(GetDeviceCatalogQuery)
export class GetDeviceCatalogHandler implements IQueryHandler<GetDeviceCatalogQuery> {
  constructor(private readonly service: DeviceCatalogService) {}
  execute(query: GetDeviceCatalogQuery) {
    return this.service.get(query.ctx, query.catalogId);
  }
}

@QueryHandler(ListDeviceCatalogQuery)
export class ListDeviceCatalogHandler implements IQueryHandler<ListDeviceCatalogQuery> {
  constructor(private readonly service: DeviceCatalogService) {}
  execute(query: ListDeviceCatalogQuery) {
    return this.service.list(query.ctx, query.filters);
  }
}

export const DeviceCatalogHandlers = [
  CreateDeviceCatalogHandler,
  UpdateDeviceCatalogHandler,
  GetDeviceCatalogHandler,
  ListDeviceCatalogHandler,
];
