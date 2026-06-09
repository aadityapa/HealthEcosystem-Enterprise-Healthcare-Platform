import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CreateInvoiceCommand,
  VoidInvoiceCommand,
  IssueInvoiceCommand,
  GetInvoiceQuery,
  ListInvoicesQuery,
  DownloadInvoiceQuery,
} from '../commands/invoices.commands';
import { InvoicesService } from '../invoices.service';

@CommandHandler(CreateInvoiceCommand)
export class CreateInvoiceHandler implements ICommandHandler<CreateInvoiceCommand> {
  constructor(private readonly service: InvoicesService) {}
  execute(cmd: CreateInvoiceCommand) {
    return this.service.createInvoice(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(VoidInvoiceCommand)
export class VoidInvoiceHandler implements ICommandHandler<VoidInvoiceCommand> {
  constructor(private readonly service: InvoicesService) {}
  execute(cmd: VoidInvoiceCommand) {
    return this.service.voidInvoice(cmd.ctx, cmd.invoiceId, cmd.dto.reason);
  }
}

@CommandHandler(IssueInvoiceCommand)
export class IssueInvoiceHandler implements ICommandHandler<IssueInvoiceCommand> {
  constructor(private readonly service: InvoicesService) {}
  execute(cmd: IssueInvoiceCommand) {
    return this.service.issueInvoice(cmd.ctx, cmd.invoiceId);
  }
}

@QueryHandler(GetInvoiceQuery)
export class GetInvoiceHandler implements IQueryHandler<GetInvoiceQuery> {
  constructor(private readonly service: InvoicesService) {}
  execute(query: GetInvoiceQuery) {
    return this.service.getInvoice(query.ctx, query.invoiceId);
  }
}

@QueryHandler(ListInvoicesQuery)
export class ListInvoicesHandler implements IQueryHandler<ListInvoicesQuery> {
  constructor(private readonly service: InvoicesService) {}
  execute(query: ListInvoicesQuery) {
    return this.service.listInvoices(query.ctx, query.filters);
  }
}

@QueryHandler(DownloadInvoiceQuery)
export class DownloadInvoiceHandler implements IQueryHandler<DownloadInvoiceQuery> {
  constructor(private readonly service: InvoicesService) {}
  execute(query: DownloadInvoiceQuery) {
    return this.service.downloadInvoice(query.ctx, query.invoiceId);
  }
}

export const InvoiceHandlers = [
  CreateInvoiceHandler,
  VoidInvoiceHandler,
  IssueInvoiceHandler,
  GetInvoiceHandler,
  ListInvoicesHandler,
  DownloadInvoiceHandler,
];
