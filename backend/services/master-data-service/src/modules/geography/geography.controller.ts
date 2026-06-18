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
import {
  CreateStateDto,
  UpdateStateDto,
  CreateCityDto,
  UpdateCityDto,
  ListCitiesQueryDto,
} from './dto/geography.dto';
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
} from './commands/geography.commands';

@ApiTags('Master Geography')
@Controller('api/v1/master')
export class StatesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get('states')
  @ApiOperation({ summary: 'List states' })
  listStates(@MasterContext() ctx: MasterRequestContext) {
    return this.queryBus.execute(new ListStatesQuery(ctx));
  }

  @Post('states/seed')
  @ApiOperation({ summary: 'Seed Indian states and union territories' })
  seedStates(@MasterContext() ctx: MasterRequestContext) {
    return this.commandBus.execute(new SeedStatesCommand(ctx));
  }

  @Post('states')
  @ApiOperation({ summary: 'Create state' })
  createState(@MasterContext() ctx: MasterRequestContext, @Body() dto: CreateStateDto) {
    return this.commandBus.execute(new CreateStateCommand(ctx, dto));
  }

  @Get('states/:id')
  @ApiOperation({ summary: 'Get state by ID' })
  getState(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetStateQuery(ctx, id));
  }

  @Patch('states/:id')
  @ApiOperation({ summary: 'Update state' })
  updateState(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStateDto,
  ) {
    return this.commandBus.execute(new UpdateStateCommand(ctx, id, dto));
  }
}

@ApiTags('Master Geography')
@Controller('api/v1/master/cities')
export class CitiesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List cities' })
  listCities(
    @MasterContext() ctx: MasterRequestContext,
    @Query() filters: ListCitiesQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListCitiesQuery(ctx, {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create city' })
  createCity(@MasterContext() ctx: MasterRequestContext, @Body() dto: CreateCityDto) {
    return this.commandBus.execute(new CreateCityCommand(ctx, dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get city by ID' })
  getCity(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetCityQuery(ctx, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update city' })
  updateCity(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCityDto,
  ) {
    return this.commandBus.execute(new UpdateCityCommand(ctx, id, dto));
  }
}
