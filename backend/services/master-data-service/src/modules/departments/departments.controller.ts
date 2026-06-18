import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { MasterContext } from '@/common/decorators/master.decorators';
import type { MasterRequestContext } from '@/common/context/master-context';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/departments.dto';
import {
  CreateDepartmentCommand,
  UpdateDepartmentCommand,
  GetDepartmentQuery,
  ListDepartmentsQuery,
} from './commands/departments.commands';

@ApiTags('Master Departments')
@Controller('api/v1/master/departments')
export class DepartmentsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List departments' })
  list(
    @MasterContext() ctx: MasterRequestContext,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListDepartmentsQuery(ctx, { page: pagination.page, limit: pagination.limit }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create department' })
  create(@MasterContext() ctx: MasterRequestContext, @Body() dto: CreateDepartmentDto) {
    return this.commandBus.execute(new CreateDepartmentCommand(ctx, dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get department by ID' })
  get(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetDepartmentQuery(ctx, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update department' })
  update(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.commandBus.execute(new UpdateDepartmentCommand(ctx, id, dto));
  }
}
