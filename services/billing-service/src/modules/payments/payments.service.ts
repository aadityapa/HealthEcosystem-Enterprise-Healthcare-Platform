import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  InvoiceStatus,
  PaymentMethod,
  PaymentStatus,
  type PrismaClient,
} from '@health/db';
import { createEvent, type EventPublisher } from '@health/events';
import { EVENT_TYPES } from '@health/shared-types';
import { PRISMA } from '@/database/database.module';
import { EVENT_PUBLISHER } from '@/kafka/kafka.constants';
import type { BillingRequestContext } from '@/common/context/billing-context';
import { round2, toNumber } from '@/common/utils/decimal.util';
import { BillingSequenceService } from '@/services/billing-sequence.service';
import { OutstandingService } from '@/services/outstanding.service';
import { PaymentGatewayFactory, type GatewayProvider } from './gateways/payment-gateway.factory';
import type { CollectPaymentDto, ProcessRefundDto } from './dto/payments.dto';

const GATEWAY_METHODS: PaymentMethod[] = [
  PaymentMethod.UPI,
  PaymentMethod.CARD,
  PaymentMethod.NETBANKING,
  PaymentMethod.WALLET,
];

@Injectable()
export class PaymentsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: EventPublisher,
    private readonly sequenceService: BillingSequenceService,
    private readonly outstandingService: OutstandingService,
    private readonly gatewayFactory: PaymentGatewayFactory,
  ) {}

  async collectPayment(
    ctx: BillingRequestContext,
    invoiceId: string,
    dto: CollectPaymentDto,
  ) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId: ctx.tenantId },
      include: { payments: true },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    const blockedStatuses: InvoiceStatus[] = [InvoiceStatus.VOID, InvoiceStatus.PAID, InvoiceStatus.REFUNDED];
    if (blockedStatuses.includes(invoice.status)) {
      throw new BadRequestException(`Cannot collect payment on ${invoice.status} invoice`);
    }

    const balance = toNumber(invoice.balanceAmount);
    if (dto.amount > balance) {
      throw new BadRequestException(`Payment amount exceeds balance of ${balance}`);
    }

    const branch = await this.prisma.branch.findFirst({
      where: { id: ctx.branchId },
    });
    if (!branch) throw new NotFoundException('Branch not found');

    const paymentNumber = await this.sequenceService.nextNumber(
      ctx.tenantId,
      ctx.branchId,
      'PAY',
      branch.code,
    );

    let gatewayOrderId = dto.gatewayOrderId;
    let gatewayPaymentId = dto.gatewayPaymentId;
    let gatewaySignature = dto.gatewaySignature;
    let status = PaymentStatus.SUCCESS;
    let gatewayResponse: unknown = null;

    const isOnline = GATEWAY_METHODS.includes(dto.method) && dto.gatewayProvider;

    if (isOnline) {
      const provider = dto.gatewayProvider as GatewayProvider;
      const adapter = this.gatewayFactory.create(provider);

      if (!gatewayOrderId) {
        const order = await adapter.createOrder({
          amount: dto.amount,
          currency: 'INR',
          receipt: paymentNumber,
          notes: { invoiceId, invoiceNumber: invoice.invoiceNumber },
        });
        gatewayOrderId = order.orderId;
        gatewayResponse = order.raw;

        if (!dto.gatewayPaymentId) {
          return {
            paymentNumber,
            gatewayOrderId,
            amount: dto.amount,
            provider,
            status: PaymentStatus.PENDING,
            checkoutRequired: true,
          };
        }
      }

      const verified = await adapter.verifyPayment({
        orderId: gatewayOrderId!,
        paymentId: dto.gatewayPaymentId!,
        signature: dto.gatewaySignature,
      });

      if (!verified.verified) {
        throw new BadRequestException('Payment verification failed');
      }

      gatewayPaymentId = verified.paymentId;
      gatewaySignature = dto.gatewaySignature;
      gatewayResponse = verified.raw;
      status = PaymentStatus.SUCCESS;
    } else if (dto.method === PaymentMethod.CHEQUE && !dto.chequeNumber) {
      throw new BadRequestException('Cheque number required for cheque payments');
    }

    const payment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.payment.create({
        data: {
          tenantId: ctx.tenantId,
          organizationId: ctx.organizationId,
          branchId: ctx.branchId,
          invoiceId,
          paymentNumber,
          method: dto.method,
          status,
          amount: dto.amount,
          gatewayProvider: dto.gatewayProvider,
          gatewayOrderId,
          gatewayPaymentId,
          gatewaySignature,
          upiId: dto.upiId,
          chequeNumber: dto.chequeNumber,
          bankReference: dto.bankReference,
          paidAt: status === PaymentStatus.SUCCESS ? new Date() : null,
          createdBy: ctx.userId,
          transactions: {
            create: {
              tenantId: ctx.tenantId,
              transactionType: 'CAPTURE',
              status,
              amount: dto.amount,
              gatewayResponse: gatewayResponse as object,
            },
          },
        },
        include: { transactions: true },
      });

      if (status === PaymentStatus.SUCCESS) {
        const newPaid = round2(toNumber(invoice.paidAmount) + dto.amount);
        const newBalance = round2(toNumber(invoice.totalAmount) - newPaid);
        const newStatus =
          newBalance <= 0
            ? InvoiceStatus.PAID
            : newPaid > 0
              ? InvoiceStatus.PARTIALLY_PAID
              : invoice.status;

        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            paidAmount: newPaid,
            balanceAmount: Math.max(0, newBalance),
            status: newStatus,
          },
        });
      }

      return created;
    });

    if (status === PaymentStatus.SUCCESS) {
      const entityType = invoice.corporateClientId ? 'corporate_client' : 'patient';
      const entityId = invoice.corporateClientId ?? invoice.patientId;
      if (entityId) {
        await this.outstandingService.onPaymentReceived(
          ctx.tenantId,
          entityType,
          entityId,
          dto.amount,
        );
      }

      await this.eventPublisher.publish(
        createEvent(
          EVENT_TYPES.PAYMENT_RECEIVED,
          'Payment',
          payment.id,
          ctx.tenantId,
          {
            paymentId: payment.id,
            invoiceId,
            amount: dto.amount,
            method: dto.method,
          },
          { organizationId: ctx.organizationId, branchId: ctx.branchId, userId: ctx.userId },
        ),
      );
    }

    return payment;
  }

  async processRefund(
    ctx: BillingRequestContext,
    paymentId: string,
    dto: ProcessRefundDto,
  ) {
    const payment = await this.prisma.payment.findFirst({
      where: { id: paymentId, tenantId: ctx.tenantId },
      include: { invoice: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== PaymentStatus.SUCCESS) {
      throw new BadRequestException('Only successful payments can be refunded');
    }

    const paidAmount = toNumber(payment.amount);
    if (dto.amount > paidAmount) {
      throw new BadRequestException('Refund amount exceeds payment amount');
    }

    let refundResponse: unknown = null;
    if (payment.gatewayProvider && payment.gatewayPaymentId) {
      const adapter = this.gatewayFactory.create(payment.gatewayProvider as GatewayProvider);
      const refund = await adapter.refund({
        paymentId: payment.gatewayPaymentId,
        amount: dto.amount,
        notes: dto.reason,
      });
      refundResponse = refund.raw;
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({
        where: { id: paymentId },
        data: {
          status: PaymentStatus.REFUNDED,
          refundedAt: new Date(),
          refundAmount: dto.amount,
          transactions: {
            create: {
              tenantId: ctx.tenantId,
              transactionType: 'REFUND',
              status: PaymentStatus.REFUNDED,
              amount: dto.amount,
              gatewayResponse: refundResponse as object,
            },
          },
        },
      });

      const invoice = payment.invoice;
      const newPaid = round2(toNumber(invoice.paidAmount) - dto.amount);
      const newBalance = round2(toNumber(invoice.totalAmount) - newPaid);

      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          paidAmount: Math.max(0, newPaid),
          balanceAmount: newBalance,
          status: newBalance > 0 ? InvoiceStatus.PARTIALLY_PAID : InvoiceStatus.PAID,
        },
      });

      return updated;
    });
  }

  async verifyWebhook(
    provider: string,
    headers: Record<string, string | string[] | undefined>,
    body: unknown,
    rawBody?: Buffer,
  ) {
    const adapter = this.gatewayFactory.create(provider.toUpperCase() as GatewayProvider);
    const result = await adapter.processWebhook({ headers, body, rawBody });

    if (!result.verified) {
      throw new BadRequestException('Webhook signature verification failed');
    }

    if (result.paymentId && result.orderId && result.status === 'captured') {
      const payment = await this.prisma.payment.findFirst({
        where: { gatewayOrderId: result.orderId },
      });
      if (payment && payment.status === PaymentStatus.PENDING) {
        await this.prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: PaymentStatus.SUCCESS,
            gatewayPaymentId: result.paymentId,
            paidAt: new Date(),
          },
        });
      }
    }

    return { received: true, eventType: result.eventType };
  }
}
