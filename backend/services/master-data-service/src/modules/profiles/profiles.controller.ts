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
import { CreateProfileDto, UpdateProfileDto } from './dto/profiles.dto';
import {
  CreateProfileCommand,
  UpdateProfileCommand,
  GetProfileQuery,
  ListProfilesQuery,
} from './commands/profiles.commands';

@ApiTags('Master Profiles')
@Controller('api/v1/master/profiles')
export class ProfilesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List profiles' })
  list(
    @MasterContext() ctx: MasterRequestContext,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListProfilesQuery(ctx, { page: pagination.page, limit: pagination.limit }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create profile' })
  create(@MasterContext() ctx: MasterRequestContext, @Body() dto: CreateProfileDto) {
    return this.commandBus.execute(new CreateProfileCommand(ctx, dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get profile by ID' })
  get(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetProfileQuery(ctx, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update profile' })
  update(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.commandBus.execute(new UpdateProfileCommand(ctx, id, dto));
  }
}
