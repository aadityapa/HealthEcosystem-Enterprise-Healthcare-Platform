import type { BillingRequestContext } from '@/common/context/billing-context';
import type { CreateInvoiceDto, VoidInvoiceDto } from '../dto/invoices.dto';

export class CreateInvoiceCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly dto: CreateInvoiceDto,
  ) {}
}

export class VoidInvoiceCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly invoiceId: string,
    public readonly dto: VoidInvoiceDto,
  ) {}
}

export class IssueInvoiceCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly invoiceId: string,
  ) {}
}

export class GetInvoiceQuery {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly invoiceId: string,
  ) {}
}

export class ListInvoicesQuery {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly filters: Record<string, unknown> & { page?: number; limit?: number },
  ) {}
}

export class DownloadInvoiceQuery {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly invoiceId: string,
  ) {}
}
