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
import { CreateBillingCodeDto, UpdateBillingCodeDto } from './dto/billing-codes.dto';
import {
  CreateBillingCodeCommand,
  UpdateBillingCodeCommand,
  GetBillingCodeQuery,
  ListBillingCodesQuery,
} from './commands/billing-codes.commands';

@ApiTags('Master Billing Codes')
@Controller('api/v1/master/billing-codes')
export class BillingCodesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List billing codes' })
  list(
    @MasterContext() ctx: MasterRequestContext,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListBillingCodesQuery(ctx, { page: pagination.page, limit: pagination.limit }),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Create billing code' })
  create(@MasterContext() ctx: MasterRequestContext, @Body() dto: CreateBillingCodeDto) {
    return this.commandBus.execute(new CreateBillingCodeCommand(ctx, dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get billing code by ID' })
  get(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetBillingCodeQuery(ctx, id));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update billing code' })
  update(
    @MasterContext() ctx: MasterRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBillingCodeDto,
  ) {
    return this.commandBus.execute(new UpdateBillingCodeCommand(ctx, id, dto));
  }
}
