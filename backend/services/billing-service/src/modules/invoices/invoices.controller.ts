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
import { BillingContext } from '@/common/decorators/billing.decorators';
import type { BillingRequestContext } from '@/common/context/billing-context';
import { CreateInvoiceDto, VoidInvoiceDto, ListInvoicesQueryDto } from './dto/invoices.dto';
import {
  CreateInvoiceCommand,
  VoidInvoiceCommand,
  IssueInvoiceCommand,
  GetInvoiceQuery,
  ListInvoicesQuery,
  DownloadInvoiceQuery,
} from './commands/invoices.commands';

@ApiTags('Invoices')
@Controller('api/v1/billing/invoices')
export class InvoicesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create invoice' })
  create(@BillingContext() ctx: BillingRequestContext, @Body() dto: CreateInvoiceDto) {
    return this.commandBus.execute(new CreateInvoiceCommand(ctx, dto));
  }

  @Get()
  @ApiOperation({ summary: 'List invoices' })
  list(
    @BillingContext() ctx: BillingRequestContext,
    @Query() filters: ListInvoicesQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListInvoicesQuery(ctx, { ...filters, page: pagination.page, limit: pagination.limit }),
    );
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download invoice' })
  download(
    @BillingContext() ctx: BillingRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new DownloadInvoiceQuery(ctx, id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invoice' })
  get(
    @BillingContext() ctx: BillingRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetInvoiceQuery(ctx, id));
  }

  @Patch(':id/issue')
  @ApiOperation({ summary: 'Issue draft invoice' })
  issue(
    @BillingContext() ctx: BillingRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.commandBus.execute(new IssueInvoiceCommand(ctx, id));
  }

  @Patch(':id/void')
  @ApiOperation({ summary: 'Void invoice' })
  voidInvoice(
    @BillingContext() ctx: BillingRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VoidInvoiceDto,
  ) {
    return this.commandBus.execute(new VoidInvoiceCommand(ctx, id, dto));
  }
}
