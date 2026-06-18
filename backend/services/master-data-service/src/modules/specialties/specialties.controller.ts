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
import { CreateSpecialtyDto, UpdateSpecialtyDto } from './dto/specialties.dto';
import {
  CreateSpecialtyCommand,
  UpdateSpecialtyCommand,
  GetSpecialtyQuery,
  ListSpecialtiesQuery,
} from './commands/specialties.commands';

@ApiTags('Master Specialties')
@Controller('api/v1/master/specialties')
export class SpecialtiesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List specialties' })
  list(
    @MasterContext() ctx: MasterRequestContext,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListSpecialtiesQuery(ctx, { page: pagination.page, limit: pagination.limit }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create specialty' })
  create(@MasterContext() ctx: MasterRequestContext, @Body() dto: CreateSpecialtyDto) {
    return this.commandBus.execute(new CreateSpecialtyCommand(ctx, dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get specialty by ID' })
  get(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetSpecialtyQuery(ctx, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update specialty' })
  update(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSpecialtyDto,
  ) {
    return this.commandBus.execute(new UpdateSpecialtyCommand(ctx, id, dto));
  }
}
