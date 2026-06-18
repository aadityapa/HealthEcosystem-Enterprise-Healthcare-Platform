import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import {
  InvoiceStatus,
  InvoiceType,
  type PrismaClient,
} from '@health/db';
import { createEvent, type EventPublisher } from '@health/events';
import { EVENT_TYPES } from '@health/shared-types';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import { EVENT_PUBLISHER } from '@/kafka/kafka.constants';
import { KafkaEventPublisher } from '@/kafka/kafka-event.publisher';
import type { BillingRequestContext } from '@/common/context/billing-context';
import { round2, toNumber, extractStateCode } from '@/common/utils/decimal.util';
import { GstCalculationService } from '@/services/gst-calculation.service';
import { PricingService } from '@/services/pricing.service';
import { BillingSequenceService } from '@/services/billing-sequence.service';
import { CreditLimitService } from '@/services/credit-limit.service';
import { OutstandingService } from '@/services/outstanding.service';
import { SurchargeService } from '@/services/surcharge.service';
import type { CreateInvoiceDto } from './dto/invoices.dto';
import type { LabOrderCreatedEvent } from '@health/shared-types';

@Injectable()
export class InvoicesService implements OnModuleInit {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: EventPublisher,
    private readonly kafkaPublisher: KafkaEventPublisher,
    private readonly gstService: GstCalculationService,
    private readonly pricingService: PricingService,
    private readonly sequenceService: BillingSequenceService,
    private readonly creditLimitService: CreditLimitService,
    private readonly outstandingService: OutstandingService,
    private readonly surchargeService: SurchargeService,
  ) {}

  onModuleInit(): void {
    this.kafkaPublisher.onLabOrderCreated(async (event) => {
      if (event.eventType !== EVENT_TYPES.LAB_ORDER_CREATED) return;
      const payload = event.payload as LabOrderCreatedEvent;
      await this.createFromLabOrder(event.tenantId, event.organizationId!, event.branchId!, event.userId!, payload);
    });
  }

  async createInvoice(ctx: BillingRequestContext, dto: CreateInvoiceDto) {
    if (!dto.lines?.length) {
      throw new BadRequestException('Invoice must contain at least one line');
    }

    const branch = await this.prisma.branch.findFirst({
      where: { id: ctx.branchId, tenantId: ctx.tenantId },
    });
    if (!branch) throw new NotFoundException('Branch not found');

    const org = await this.prisma.organization.findFirst({
      where: { id: ctx.organizationId, tenantId: ctx.tenantId },
    });

    const gstin = org?.gstin ?? null;
    const placeOfSupply = dto.placeOfSupply ?? extractStateCode(gstin) ?? '27';
    const gstType = this.gstService.determineGstType(gstin, placeOfSupply);

    let subtotal = 0;
    let totalDiscount = 0;
    const resolvedLines: Array<{
      lineType: string;
      itemCode?: string;
      description: string;
      hsnSacCode?: string;
      quantity: number;
      unitPrice: number;
      discount: number;
      taxableAmount: number;
      cgstRate: number;
      sgstRate: number;
      igstRate: number;
      cgstAmount: number;
      sgstAmount: number;
      igstAmount: number;
      lineTotal: number;
      referenceType?: string;
      referenceId?: string;
    }> = [];

    for (const line of dto.lines) {
      const resolved = line.unitPrice != null
        ? {
            description: line.description ?? line.lineType,
            unitPrice: line.unitPrice,
            quantity: line.quantity ?? 1,
            discount: line.discount ?? 0,
            hsnSacCode: undefined as string | undefined,
            taxRates: { cgstRate: 9, sgstRate: 9, igstRate: 18, isExempt: false },
          }
        : await this.pricingService.resolveLine(ctx, line, {
            corporateClientId: dto.corporateClientId,
            invoiceType: dto.invoiceType,
          });

      const quantity = resolved.quantity;
      const lineSubtotal = round2(resolved.unitPrice * quantity);
      const discount = line.discount ?? resolved.discount;
      const taxableAmount = round2(lineSubtotal - discount);
      const tax = this.gstService.calculateLineTax(
        { taxableAmount, taxRates: resolved.taxRates },
        gstType,
      );

      subtotal += lineSubtotal;
      totalDiscount += discount;

      resolvedLines.push({
        lineType: line.lineType,
        itemCode: line.itemCode,
        description: resolved.description,
        hsnSacCode: resolved.hsnSacCode,
        quantity,
        unitPrice: resolved.unitPrice,
        discount,
        taxableAmount,
        cgstRate: tax.cgstRate,
        sgstRate: tax.sgstRate,
        igstRate: tax.igstRate,
        cgstAmount: tax.cgstAmount,
        sgstAmount: tax.sgstAmount,
        igstAmount: tax.igstAmount,
        lineTotal: round2(taxableAmount + tax.totalTax),
        referenceType: line.referenceType,
        referenceId: line.referenceId,
      });
    }

    const surcharges = await this.surchargeService.calculateSurcharges(
      ctx,
      dto.invoiceType,
      subtotal - totalDiscount,
    );

    for (const surcharge of surcharges) {
      const tax = this.gstService.calculateLineTax(
        {
          taxableAmount: surcharge.amount,
          taxRates: { cgstRate: 9, sgstRate: 9, igstRate: 18, isExempt: false },
        },
        gstType,
      );
      resolvedLines.push({
        lineType: 'SURCHARGE',
        description: surcharge.description,
        quantity: 1,
        unitPrice: surcharge.amount,
        discount: 0,
        taxableAmount: surcharge.amount,
        cgstRate: tax.cgstRate,
        sgstRate: tax.sgstRate,
        igstRate: tax.igstRate,
        cgstAmount: tax.cgstAmount,
        sgstAmount: tax.sgstAmount,
        igstAmount: tax.igstAmount,
        lineTotal: round2(surcharge.amount + tax.totalTax),
      });
      subtotal += surcharge.amount;
    }

    const taxableAmount = round2(
      resolvedLines.reduce((s, l) => s + l.taxableAmount, 0),
    );
    const cgstAmount = round2(resolvedLines.reduce((s, l) => s + l.cgstAmount, 0));
    const sgstAmount = round2(resolvedLines.reduce((s, l) => s + l.sgstAmount, 0));
    const igstAmount = round2(resolvedLines.reduce((s, l) => s + l.igstAmount, 0));
    const totalAmount = round2(taxableAmount + cgstAmount + sgstAmount + igstAmount);

    if (dto.corporateClientId && dto.invoiceType === InvoiceType.CORPORATE) {
      await this.creditLimitService.assertAvailableCredit(ctx, dto.corporateClientId, totalAmount);
    }

    const invoiceNumber = await this.sequenceService.nextNumber(
      ctx.tenantId,
      ctx.branchId,
      'INV',
      branch.code,
    );

    const invoice = await this.prisma.$transaction(async (tx) => {
      const created = await tx.invoice.create({
        data: {
          tenantId: ctx.tenantId,
          organizationId: ctx.organizationId,
          branchId: ctx.branchId,
          patientId: dto.patientId,
          corporateClientId: dto.corporateClientId,
          invoiceNumber,
          invoiceType: dto.invoiceType,
          status: InvoiceStatus.DRAFT,
          referenceType: dto.referenceType,
          referenceId: dto.referenceId,
          subtotal,
          discountAmount: totalDiscount,
          taxableAmount,
          cgstAmount,
          sgstAmount,
          igstAmount,
          totalAmount,
          balanceAmount: totalAmount,
          gstin,
          placeOfSupply,
          gstType,
          dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
          notes: dto.notes,
          createdBy: ctx.userId,
          lines: {
            create: resolvedLines.map((line, idx) => ({
              tenantId: ctx.tenantId,
              organizationId: ctx.organizationId,
              branchId: ctx.branchId,
              ...line,
              sortOrder: idx,
            })),
          },
        },
        include: { lines: true },
      });

      const hsnGroups = new Map<string, typeof resolvedLines[0]>();
      for (const line of resolvedLines) {
        const hsn = line.hsnSacCode ?? '999799';
        const existing = hsnGroups.get(hsn);
        if (existing) {
          existing.taxableAmount += line.taxableAmount;
          existing.cgstAmount += line.cgstAmount;
          existing.sgstAmount += line.sgstAmount;
          existing.igstAmount += line.igstAmount;
        } else {
          hsnGroups.set(hsn, { ...line });
        }
      }

      for (const [hsnSacCode, line] of hsnGroups) {
        await tx.gstLine.create({
          data: {
            tenantId: ctx.tenantId,
            invoiceId: created.id,
            hsnSacCode,
            taxableValue: line.taxableAmount,
            cgstRate: line.cgstRate,
            sgstRate: line.sgstRate,
            igstRate: line.igstRate,
            cgstAmount: line.cgstAmount,
            sgstAmount: line.sgstAmount,
            igstAmount: line.igstAmount,
          },
        });
      }

      if (dto.corporateClientId && dto.invoiceType === InvoiceType.CORPORATE) {
        await this.creditLimitService.reserveCredit(dto.corporateClientId, totalAmount);
      }

      return created;
    });

    await this.eventPublisher.publish(
      createEvent(
        EVENT_TYPES.INVOICE_CREATED,
        'Invoice',
        invoice.id,
        ctx.tenantId,
        {
          invoiceId: invoice.id,
          invoiceNumber: invoice.invoiceNumber,
          patientId: dto.patientId,
          corporateClientId: dto.corporateClientId,
          totalAmount,
          invoiceType: dto.invoiceType,
        },
        {
          organizationId: ctx.organizationId,
          branchId: ctx.branchId,
          userId: ctx.userId,
        },
      ),
    );

    return invoice;
  }

  async issueInvoice(ctx: BillingRequestContext, invoiceId: string) {
    const invoice = await this.findInvoice(ctx, invoiceId);

    if (invoice.status !== InvoiceStatus.DRAFT) {
      throw new BadRequestException('Only draft invoices can be issued');
    }

    const updated = await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: InvoiceStatus.ISSUED, issuedAt: new Date() },
      include: { lines: true, gstLines: true },
    });

    const entityType = updated.corporateClientId ? 'corporate_client' : 'patient';
    const entityId = updated.corporateClientId ?? updated.patientId;
    if (entityId) {
      await this.outstandingService.onInvoiceIssued(
        ctx.tenantId,
        ctx.organizationId,
        entityType,
        entityId,
        toNumber(updated.balanceAmount),
        updated.dueDate,
      );
    }

    return updated;
  }

  async voidInvoice(ctx: BillingRequestContext, invoiceId: string, reason: string) {
    const invoice = await this.findInvoice(ctx, invoiceId);

    if (invoice.status === InvoiceStatus.VOID) {
      throw new BadRequestException('Invoice is already voided');
    }
    if (toNumber(invoice.paidAmount) > 0) {
      throw new BadRequestException('Cannot void invoice with payments');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      const voided = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.VOID,
          voidedAt: new Date(),
          voidReason: reason,
          balanceAmount: 0,
        },
        include: { lines: true },
      });

      if (voided.corporateClientId) {
        await this.creditLimitService.releaseCredit(
          voided.corporateClientId,
          toNumber(voided.totalAmount),
        );
      }

      return voided;
    });

    await this.eventPublisher.publish(
      createEvent(
        EVENT_TYPES.INVOICE_VOIDED,
        'Invoice',
        invoiceId,
        ctx.tenantId,
        { invoiceId, reason },
        { organizationId: ctx.organizationId, branchId: ctx.branchId, userId: ctx.userId },
      ),
    );

    return updated;
  }

  async getInvoice(ctx: BillingRequestContext, invoiceId: string) {
    return this.findInvoice(ctx, invoiceId, true);
  }

  async listInvoices(
    ctx: BillingRequestContext,
    filters: Record<string, unknown> & { page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      ...(filters.status ? { status: filters.status as InvoiceStatus } : {}),
      ...(filters.patientId ? { patientId: filters.patientId as string } : {}),
      ...(filters.corporateClientId
        ? { corporateClientId: filters.corporateClientId as string }
        : {}),
      ...(filters.referenceType ? { referenceType: filters.referenceType as string } : {}),
      ...(filters.referenceId ? { referenceId: filters.referenceId as string } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        include: { lines: true },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async downloadInvoice(ctx: BillingRequestContext, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId: ctx.tenantId },
      include: { lines: { orderBy: { sortOrder: 'asc' } } },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    return {
      invoiceNumber: invoice.invoiceNumber,
      format: 'json',
      content: {
        header: {
          invoiceNumber: invoice.invoiceNumber,
          invoiceType: invoice.invoiceType,
          status: invoice.status,
          issuedAt: invoice.issuedAt,
          gstin: invoice.gstin,
          placeOfSupply: invoice.placeOfSupply,
        },
        amounts: {
          subtotal: toNumber(invoice.subtotal),
          discount: toNumber(invoice.discountAmount),
          taxableAmount: toNumber(invoice.taxableAmount),
          cgst: toNumber(invoice.cgstAmount),
          sgst: toNumber(invoice.sgstAmount),
          igst: toNumber(invoice.igstAmount),
          total: toNumber(invoice.totalAmount),
          paid: toNumber(invoice.paidAmount),
          balance: toNumber(invoice.balanceAmount),
        },
        lines: invoice.lines?.map((l) => ({
          description: l.description,
          quantity: toNumber(l.quantity),
          unitPrice: toNumber(l.unitPrice),
          lineTotal: toNumber(l.lineTotal),
        })),
      },
    };
  }

  private async findInvoice(ctx: BillingRequestContext, invoiceId: string, includeLines = false) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: invoiceId, tenantId: ctx.tenantId },
      include: includeLines
        ? { lines: { orderBy: { sortOrder: 'asc' } }, payments: true, gstLines: true }
        : undefined,
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  private async createFromLabOrder(
    tenantId: string,
    organizationId: string,
    branchId: string,
    userId: string,
    payload: LabOrderCreatedEvent,
  ) {
    const existing = await this.prisma.invoice.findFirst({
      where: {
        tenantId,
        referenceType: 'lab_order',
        referenceId: payload.orderId,
      },
    });
    if (existing) return existing;

    const order = await this.prisma.labOrder.findFirst({
      where: { id: payload.orderId, tenantId },
      include: { items: true },
    });
    if (!order) return null;

    const ctx: BillingRequestContext = { tenantId, organizationId, branchId, userId };
    return this.createInvoice(ctx, {
      invoiceType: InvoiceType.LAB,
      patientId: payload.patientId,
      referenceType: 'lab_order',
      referenceId: payload.orderId,
      lines: order.items.map((item) => ({
        lineType: 'TEST',
        referenceId: item.testId ?? undefined,
        referenceType: 'test',
        description: item.itemName,
        quantity: item.quantity,
        unitPrice: toNumber(item.unitPrice),
        discount: toNumber(item.discount),
      })),
    });
  }
}
