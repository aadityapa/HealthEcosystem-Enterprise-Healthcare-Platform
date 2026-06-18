import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  CollectPaymentCommand,
  ProcessRefundCommand,
  VerifyWebhookCommand,
} from '../commands/payments.commands';
import { PaymentsService } from '../payments.service';

@CommandHandler(CollectPaymentCommand)
export class CollectPaymentHandler implements ICommandHandler<CollectPaymentCommand> {
  constructor(private readonly service: PaymentsService) {}
  execute(cmd: CollectPaymentCommand) {
    return this.service.collectPayment(cmd.ctx, cmd.invoiceId, cmd.dto);
  }
}

@CommandHandler(ProcessRefundCommand)
export class ProcessRefundHandler implements ICommandHandler<ProcessRefundCommand> {
  constructor(private readonly service: PaymentsService) {}
  execute(cmd: ProcessRefundCommand) {
    return this.service.processRefund(cmd.ctx, cmd.paymentId, cmd.dto);
  }
}

@CommandHandler(VerifyWebhookCommand)
export class VerifyWebhookHandler implements ICommandHandler<VerifyWebhookCommand> {
  constructor(private readonly service: PaymentsService) {}
  execute(cmd: VerifyWebhookCommand) {
    return this.service.verifyWebhook(cmd.provider, cmd.headers, cmd.body, cmd.rawBody);
  }
}

export const PaymentHandlers = [
  CollectPaymentHandler,
  ProcessRefundHandler,
  VerifyWebhookHandler,
];
