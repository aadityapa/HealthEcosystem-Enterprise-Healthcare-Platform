import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { BillingContext } from '@/common/decorators/billing.decorators';
import type { BillingRequestContext } from '@/common/context/billing-context';
import {
  CreateRevenueShareRuleDto,
  CalculateSettlementDto,
  ListSettlementsQueryDto,
} from './dto/franchise.dto';
import {
  CreateRevenueShareRuleCommand,
  CalculateSettlementCommand,
  ListRevenueShareRulesQuery,
  ListSettlementsQuery,
} from './commands/franchise.commands';

@ApiTags('Franchise')
@Controller('api/v1/billing/franchise')
export class FranchiseController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('revenue-rules')
  @ApiOperation({ summary: 'Create revenue share rule' })
  createRule(@BillingContext() ctx: BillingRequestContext, @Body() dto: CreateRevenueShareRuleDto) {
    return this.commandBus.execute(new CreateRevenueShareRuleCommand(ctx, dto));
  }

  @Get('revenue-rules')
  @ApiOperation({ summary: 'List revenue share rules' })
  listRules(
    @BillingContext() ctx: BillingRequestContext,
    @Query('franchiseBranchId') franchiseBranchId?: string,
  ) {
    return this.queryBus.execute(new ListRevenueShareRulesQuery(ctx, franchiseBranchId));
  }

  @Post('settlements')
  @ApiOperation({ summary: 'Calculate franchise settlement for period' })
  calculate(
    @BillingContext() ctx: BillingRequestContext,
    @Body() dto: CalculateSettlementDto,
  ) {
    return this.commandBus.execute(new CalculateSettlementCommand(ctx, dto));
  }

  @Get('settlements')
  @ApiOperation({ summary: 'List franchise settlements' })
  listSettlements(
    @BillingContext() ctx: BillingRequestContext,
    @Query() filters: ListSettlementsQueryDto,
  ) {
    return this.queryBus.execute(new ListSettlementsQuery(ctx, filters));
  }
}
