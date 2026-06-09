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
import { CreateTaxDto, UpdateTaxDto } from './dto/tax.dto';
import {
  CreateTaxCommand,
  UpdateTaxCommand,
  GetTaxQuery,
  ListTaxQuery,
} from './commands/tax.commands';

@ApiTags('Master Tax')
@Controller('api/v1/master/tax')
export class TaxController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List tax rates' })
  list(
    @MasterContext() ctx: MasterRequestContext,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListTaxQuery(ctx, { page: pagination.page, limit: pagination.limit }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create tax rate' })
  create(@MasterContext() ctx: MasterRequestContext, @Body() dto: CreateTaxDto) {
    return this.commandBus.execute(new CreateTaxCommand(ctx, dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tax rate by ID' })
  get(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetTaxQuery(ctx, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tax rate' })
  update(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTaxDto,
  ) {
    return this.commandBus.execute(new UpdateTaxCommand(ctx, id, dto));
  }
}
