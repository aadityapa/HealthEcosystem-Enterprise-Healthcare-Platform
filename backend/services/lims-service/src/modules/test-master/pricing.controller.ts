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
import { LimsContext } from '@/common/decorators/lims.decorators';
import type { LimsRequestContext } from '@/common/context/lims-context';
import {
  CreatePricingDto,
  UpdatePricingDto,
  ListPricingQueryDto,
} from './dto/test-master.dto';
import {
  CreatePricingCommand,
  UpdatePricingCommand,
  ListPricingQuery,
} from './commands/test-master.commands';

@ApiTags('Pricing')
@Controller('api/v1/lims/pricing')
export class PricingController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get pricing' })
  listPricing(
    @LimsContext() ctx: LimsRequestContext,
    @Query() filters: ListPricingQueryDto,
  ) {
    return this.queryBus.execute(new ListPricingQuery(ctx, filters));
  }

  @Post()
  @ApiOperation({ summary: 'Create pricing' })
  createPricing(@LimsContext() ctx: LimsRequestContext, @Body() dto: CreatePricingDto) {
    return this.commandBus.execute(new CreatePricingCommand(ctx, dto));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update pricing' })
  updatePricing(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePricingDto,
  ) {
    return this.commandBus.execute(new UpdatePricingCommand(ctx, id, dto));
  }
}
