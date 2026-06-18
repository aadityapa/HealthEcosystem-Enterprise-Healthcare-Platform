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
import { CreateRateCardDto, UpdateRateCardDto } from './dto/rate-cards.dto';
import {
  CreateRateCardCommand,
  UpdateRateCardCommand,
  GetRateCardQuery,
  ListRateCardsQuery,
} from './commands/rate-cards.commands';

@ApiTags('Master Rate Cards')
@Controller('api/v1/master/rate-cards')
export class RateCardsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List rate cards' })
  list(
    @MasterContext() ctx: MasterRequestContext,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListRateCardsQuery(ctx, { page: pagination.page, limit: pagination.limit }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create rate card' })
  create(@MasterContext() ctx: MasterRequestContext, @Body() dto: CreateRateCardDto) {
    return this.commandBus.execute(new CreateRateCardCommand(ctx, dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rate card by ID' })
  get(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetRateCardQuery(ctx, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update rate card' })
  update(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRateCardDto,
  ) {
    return this.commandBus.execute(new UpdateRateCardCommand(ctx, id, dto));
  }
}
