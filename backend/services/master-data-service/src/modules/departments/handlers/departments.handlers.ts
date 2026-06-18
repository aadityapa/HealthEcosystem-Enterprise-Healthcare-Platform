import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CreateDepartmentCommand,
  UpdateDepartmentCommand,
  GetDepartmentQuery,
  ListDepartmentsQuery,
} from '../commands/departments.commands';
import { DepartmentsService } from '../departments.service';

@CommandHandler(CreateDepartmentCommand)
export class CreateDepartmentHandler implements ICommandHandler<CreateDepartmentCommand> {
  constructor(private readonly service: DepartmentsService) {}
  execute(cmd: CreateDepartmentCommand) {
    return this.service.create(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdateDepartmentCommand)
export class UpdateDepartmentHandler implements ICommandHandler<UpdateDepartmentCommand> {
  constructor(private readonly service: DepartmentsService) {}
  execute(cmd: UpdateDepartmentCommand) {
    return this.service.update(cmd.ctx, cmd.departmentId, cmd.dto);
  }
}

@QueryHandler(GetDepartmentQuery)
export class GetDepartmentHandler implements IQueryHandler<GetDepartmentQuery> {
  constructor(private readonly service: DepartmentsService) {}
  execute(query: GetDepartmentQuery) {
    return this.service.get(query.ctx, query.departmentId);
  }
}

@QueryHandler(ListDepartmentsQuery)
export class ListDepartmentsHandler implements IQueryHandler<ListDepartmentsQuery> {
  constructor(private readonly service: DepartmentsService) {}
  execute(query: ListDepartmentsQuery) {
    return this.service.list(query.ctx, query.filters);
  }
}

export const DepartmentsHandlers = [
  CreateDepartmentHandler,
  UpdateDepartmentHandler,
  GetDepartmentHandler,
  ListDepartmentsHandler,
];
