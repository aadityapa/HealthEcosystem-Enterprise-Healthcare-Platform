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
import { BillingContext } from '@/common/decorators/billing.decorators';
import type { BillingRequestContext } from '@/common/context/billing-context';
import {
  CreateInsuranceTPADto,
  CreateInsuranceClaimDto,
  UpdateClaimStatusDto,
  ReconcileClaimDto,
} from './dto/insurance.dto';
import {
  CreateInsuranceTPACommand,
  CreateInsuranceClaimCommand,
  SubmitClaimCommand,
  UpdateClaimStatusCommand,
  ReconcileClaimCommand,
  ListInsuranceTPAsQuery,
  ListInsuranceClaimsQuery,
  GetInsuranceClaimQuery,
} from './commands/insurance.commands';

@ApiTags('Insurance')
@Controller('api/v1/billing/insurance')
export class InsuranceController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('tpas')
  @ApiOperation({ summary: 'Create insurance TPA' })
  createTPA(@BillingContext() ctx: BillingRequestContext, @Body() dto: CreateInsuranceTPADto) {
    return this.commandBus.execute(new CreateInsuranceTPACommand(ctx, dto));
  }

  @Get('tpas')
  @ApiOperation({ summary: 'List insurance TPAs' })
  listTPAs(@BillingContext() ctx: BillingRequestContext) {
    return this.queryBus.execute(new ListInsuranceTPAsQuery(ctx));
  }

  @Post('claims')
  @ApiOperation({ summary: 'Create insurance claim' })
  createClaim(@BillingContext() ctx: BillingRequestContext, @Body() dto: CreateInsuranceClaimDto) {
    return this.commandBus.execute(new CreateInsuranceClaimCommand(ctx, dto));
  }

  @Get('claims')
  @ApiOperation({ summary: 'List insurance claims' })
  listClaims(
    @BillingContext() ctx: BillingRequestContext,
    @Query('status') status?: string,
    @Query('tpaId') tpaId?: string,
  ) {
    return this.queryBus.execute(new ListInsuranceClaimsQuery(ctx, { status, tpaId }));
  }

  @Get('claims/:id')
  @ApiOperation({ summary: 'Get insurance claim' })
  getClaim(
    @BillingContext() ctx: BillingRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetInsuranceClaimQuery(ctx, id));
  }

  @Patch('claims/:id/submit')
  @ApiOperation({ summary: 'Submit insurance claim' })
  submitClaim(
    @BillingContext() ctx: BillingRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.commandBus.execute(new SubmitClaimCommand(ctx, id));
  }

  @Patch('claims/:id/status')
  @ApiOperation({ summary: 'Update claim status' })
  updateStatus(
    @BillingContext() ctx: BillingRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateClaimStatusDto,
  ) {
    return this.commandBus.execute(new UpdateClaimStatusCommand(ctx, id, dto));
  }

  @Patch('claims/:id/reconcile')
  @ApiOperation({ summary: 'Reconcile insurance claim' })
  reconcile(
    @BillingContext() ctx: BillingRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReconcileClaimDto,
  ) {
    return this.commandBus.execute(new ReconcileClaimCommand(ctx, id, dto));
  }
}
