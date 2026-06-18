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
import { CreateDeviceCatalogDto, UpdateDeviceCatalogDto } from './dto/device-catalog.dto';
import {
  CreateDeviceCatalogCommand,
  UpdateDeviceCatalogCommand,
  GetDeviceCatalogQuery,
  ListDeviceCatalogQuery,
} from './commands/device-catalog.commands';

@ApiTags('Master Device Catalog')
@Controller('api/v1/master/device-catalog')
export class DeviceCatalogController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List device catalog entries' })
  list(
    @MasterContext() ctx: MasterRequestContext,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListDeviceCatalogQuery(ctx, { page: pagination.page, limit: pagination.limit }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create device catalog entry' })
  create(@MasterContext() ctx: MasterRequestContext, @Body() dto: CreateDeviceCatalogDto) {
    return this.commandBus.execute(new CreateDeviceCatalogCommand(ctx, dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get device catalog entry by ID' })
  get(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetDeviceCatalogQuery(ctx, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update device catalog entry' })
  update(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDeviceCatalogDto,
  ) {
    return this.commandBus.execute(new UpdateDeviceCatalogCommand(ctx, id, dto));
  }
}
