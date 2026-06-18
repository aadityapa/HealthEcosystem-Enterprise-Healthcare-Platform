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
  CreateCorporateClientDto,
  CreateCorporateContractDto,
  UpsertCreditLimitDto,
  GenerateStatementDto,
  UpdateCorporateClientDto,
} from './dto/corporate.dto';
import {
  CreateCorporateClientCommand,
  UpdateCorporateClientCommand,
  CreateCorporateContractCommand,
  UpsertCreditLimitCommand,
  GenerateStatementCommand,
  ListCorporateClientsQuery,
  ListCorporateContractsQuery,
  ListStatementsQuery,
} from './commands/corporate.commands';

@ApiTags('Corporate')
@Controller('api/v1/billing/corporate')
export class CorporateController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('clients')
  @ApiOperation({ summary: 'Create corporate client' })
  createClient(@BillingContext() ctx: BillingRequestContext, @Body() dto: CreateCorporateClientDto) {
    return this.commandBus.execute(new CreateCorporateClientCommand(ctx, dto));
  }

  @Get('clients')
  @ApiOperation({ summary: 'List corporate clients' })
  listClients(@BillingContext() ctx: BillingRequestContext) {
    return this.queryBus.execute(new ListCorporateClientsQuery(ctx));
  }

  @Patch('clients/:id')
  @ApiOperation({ summary: 'Update corporate client' })
  updateClient(
    @BillingContext() ctx: BillingRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCorporateClientDto,
  ) {
    return this.commandBus.execute(new UpdateCorporateClientCommand(ctx, id, dto));
  }

  @Post('contracts')
  @ApiOperation({ summary: 'Create corporate contract' })
  createContract(
    @BillingContext() ctx: BillingRequestContext,
    @Body() dto: CreateCorporateContractDto,
  ) {
    return this.commandBus.execute(new CreateCorporateContractCommand(ctx, dto));
  }

  @Get('contracts')
  @ApiOperation({ summary: 'List corporate contracts' })
  listContracts(
    @BillingContext() ctx: BillingRequestContext,
    @Query('corporateClientId') corporateClientId?: string,
  ) {
    return this.queryBus.execute(new ListCorporateContractsQuery(ctx, corporateClientId));
  }

  @Post('credit-limits')
  @ApiOperation({ summary: 'Upsert credit limit' })
  upsertCreditLimit(
    @BillingContext() ctx: BillingRequestContext,
    @Body() dto: UpsertCreditLimitDto,
  ) {
    return this.commandBus.execute(new UpsertCreditLimitCommand(ctx, dto));
  }

  @Post('statements')
  @ApiOperation({ summary: 'Generate monthly statement' })
  generateStatement(
    @BillingContext() ctx: BillingRequestContext,
    @Body() dto: GenerateStatementDto,
  ) {
    return this.commandBus.execute(new GenerateStatementCommand(ctx, dto));
  }

  @Get('statements')
  @ApiOperation({ summary: 'List monthly statements' })
  listStatements(
    @BillingContext() ctx: BillingRequestContext,
    @Query('corporateClientId') corporateClientId?: string,
  ) {
    return this.queryBus.execute(new ListStatementsQuery(ctx, corporateClientId));
  }
}
