import type { BillingRequestContext } from '@/common/context/billing-context';
import type { CollectPaymentDto, ProcessRefundDto } from '../dto/payments.dto';

export class CollectPaymentCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly invoiceId: string,
    public readonly dto: CollectPaymentDto,
  ) {}
}

export class ProcessRefundCommand {
  constructor(
    public readonly ctx: BillingRequestContext,
    public readonly paymentId: string,
    public readonly dto: ProcessRefundDto,
  ) {}
}

export class VerifyWebhookCommand {
  constructor(
    public readonly provider: string,
    public readonly headers: Record<string, string | string[] | undefined>,
    public readonly body: unknown,
    public readonly rawBody?: Buffer,
  ) {}
}
