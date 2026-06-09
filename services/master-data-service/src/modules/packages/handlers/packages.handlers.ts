import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CreatePackageCommand,
  UpdatePackageCommand,
  GetPackageQuery,
  ListPackagesQuery,
} from '../commands/packages.commands';
import { PackagesService } from '../packages.service';

@CommandHandler(CreatePackageCommand)
export class CreatePackageHandler implements ICommandHandler<CreatePackageCommand> {
  constructor(private readonly service: PackagesService) {}
  execute(cmd: CreatePackageCommand) {
    return this.service.createPackage(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdatePackageCommand)
export class UpdatePackageHandler implements ICommandHandler<UpdatePackageCommand> {
  constructor(private readonly service: PackagesService) {}
  execute(cmd: UpdatePackageCommand) {
    return this.service.updatePackage(cmd.ctx, cmd.packageId, cmd.dto);
  }
}

@QueryHandler(GetPackageQuery)
export class GetPackageHandler implements IQueryHandler<GetPackageQuery> {
  constructor(private readonly service: PackagesService) {}
  execute(query: GetPackageQuery) {
    return this.service.getPackage(query.ctx, query.packageId);
  }
}

@QueryHandler(ListPackagesQuery)
export class ListPackagesHandler implements IQueryHandler<ListPackagesQuery> {
  constructor(private readonly service: PackagesService) {}
  execute(query: ListPackagesQuery) {
    return this.service.listPackages(query.ctx, query.filters);
  }
}

export const PackagesHandlers = [
  CreatePackageHandler,
  UpdatePackageHandler,
  GetPackageHandler,
  ListPackagesHandler,
];
