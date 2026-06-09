import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  SampleStatus,
  type PrismaClient,
} from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { LimsRequestContext } from '@/common/context/lims-context';
import { OrderNumberService } from '@/services/sequence.service';
import { BarcodeService } from '@/services/sequence.service';
import { SampleWorkflowService, SAMPLE_WORKFLOW_EVENT_TYPES } from '@/services/sample-workflow.service';
import type { CreateLabOrderDto } from './dto/orders.dto';

interface ResolvedOrderItem {
  testId: string;
  itemName: string;
  specimenType: string;
  unitPrice: number;
  discount: number;
  quantity: number;
}

@Injectable()
export class OrdersService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly orderNumberService: OrderNumberService,
    private readonly barcodeService: BarcodeService,
    private readonly sampleWorkflow: SampleWorkflowService,
  ) {}

  async createOrder(ctx: LimsRequestContext, dto: CreateLabOrderDto) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must contain at least one item');
    }

    const branch = await this.prisma.branch.findFirst({
      where: { id: ctx.branchId, tenantId: ctx.tenantId },
    });
    if (!branch) {
      throw new NotFoundException('Branch not found');
    }

    const patient = await this.prisma.patient.findFirst({
      where: { id: dto.patientId, tenantId: ctx.tenantId },
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const resolvedItems = await this.resolveOrderItems(ctx, dto);

    const orderNumber = await this.orderNumberService.generate(
      ctx.tenantId,
      ctx.branchId,
      branch.code,
    );

    let subtotal = 0;
    let totalDiscount = 0;

    for (const item of resolvedItems) {
      subtotal += item.unitPrice * item.quantity;
      totalDiscount += item.discount;
    }

    const totalAmount = subtotal - totalDiscount;

    return this.prisma.$transaction(async (tx) => {
      const order = await tx.labOrder.create({
        data: {
          tenantId: ctx.tenantId,
          organizationId: ctx.organizationId,
          branchId: ctx.branchId,
          patientId: dto.patientId,
          orderNumber,
          orderSource: dto.orderSource ?? 'walk_in',
          status: OrderStatus.CONFIRMED,
          priority: dto.priority ?? 'routine',
          orderedBy: dto.orderedBy ?? ctx.userId,
          referringDoctor: dto.referringDoctor,
          clinicalNotes: dto.clinicalNotes,
          subtotal,
          discount: totalDiscount,
          taxAmount: 0,
          totalAmount,
        },
      });

      const samples = [];

      for (const item of resolvedItems) {
        const lineTotal = item.unitPrice * item.quantity - item.discount;
        const orderItem = await tx.labOrderItem.create({
          data: {
            tenantId: ctx.tenantId,
            organizationId: ctx.organizationId,
            branchId: ctx.branchId,
            labOrderId: order.id,
            testId: item.testId,
            itemName: item.itemName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: item.discount,
            lineTotal,
            status: 'pending',
          },
        });

        const barcode = await this.barcodeService.generate(
          ctx.tenantId,
          ctx.branchId,
          branch.code,
        );

        const sample = await tx.sample.create({
          data: {
            tenantId: ctx.tenantId,
            organizationId: ctx.organizationId,
            branchId: ctx.branchId,
            labOrderId: order.id,
            labOrderItemId: orderItem.id,
            sampleNumber: barcode,
            barcode,
            sampleType: item.specimenType,
            status: SampleStatus.ORDERED,
            collectionBranchId: ctx.branchId,
          },
        });

        await tx.sampleEvent.create({
          data: {
            tenantId: ctx.tenantId,
            organizationId: ctx.organizationId,
            branchId: ctx.branchId,
            sampleId: sample.id,
            fromStatus: null,
            toStatus: SampleStatus.ORDERED,
            eventType: SAMPLE_WORKFLOW_EVENT_TYPES.ORDER_CREATED,
            notes: `Order ${orderNumber} created`,
            performedBy: ctx.userId,
          },
        });

        samples.push(sample);
      }

      return tx.labOrder.findUniqueOrThrow({
        where: { id: order.id },
        include: {
          items: true,
          samples: true,
          patient: { select: { id: true, uhid: true, firstName: true, lastName: true } },
        },
      });
    });
  }

  private async resolveOrderItems(
    ctx: LimsRequestContext,
    dto: CreateLabOrderDto,
  ): Promise<ResolvedOrderItem[]> {
    const resolved: ResolvedOrderItem[] = [];

    for (const item of dto.items) {
      if (!item.testId && !item.packageId) {
        throw new BadRequestException('Each order item must specify testId or packageId');
      }
      if (item.testId && item.packageId) {
        throw new BadRequestException('Order item cannot have both testId and packageId');
      }

      if (item.testId) {
        const test = await this.prisma.testMaster.findFirst({
          where: { id: item.testId, tenantId: ctx.tenantId, isActive: true },
        });
        if (!test) throw new NotFoundException(`Test ${item.testId} not found`);

        const pricing = await this.prisma.testPricing.findFirst({
          where: {
            tenantId: ctx.tenantId,
            testId: item.testId,
            OR: [{ branchId: ctx.branchId }, { branchId: null }],
          },
          orderBy: { effectiveFrom: 'desc' },
        });

        const unitPrice = item.unitPrice ?? Number(pricing?.basePrice ?? 0);
        resolved.push({
          testId: test.id,
          itemName: test.name,
          specimenType: test.specimenType,
          unitPrice,
          discount: item.discount ?? 0,
          quantity: item.quantity ?? 1,
        });
        continue;
      }

      const pkg = await this.prisma.packageMaster.findFirst({
        where: { id: item.packageId!, tenantId: ctx.tenantId, isActive: true },
        include: { tests: { include: { test: true } } },
      });
      if (!pkg) throw new NotFoundException(`Package ${item.packageId} not found`);
      if (!pkg.tests.length) {
        throw new BadRequestException(`Package ${pkg.code} has no tests`);
      }

      const perTestPrice = Number(pkg.packagePrice) / pkg.tests.length;
      for (const pt of pkg.tests) {
        resolved.push({
          testId: pt.testId,
          itemName: `${pkg.name} - ${pt.test.name}`,
          specimenType: pt.test.specimenType,
          unitPrice: item.unitPrice ?? perTestPrice,
          discount: (item.discount ?? 0) / pkg.tests.length,
          quantity: item.quantity ?? 1,
        });
      }
    }

    return resolved;
  }

  async cancelOrder(ctx: LimsRequestContext, orderId: string, reason?: string) {
    const order = await this.prisma.labOrder.findFirst({
      where: { id: orderId, tenantId: ctx.tenantId },
      include: { samples: true },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (order.status === OrderStatus.CANCELLED) {
      throw new BadRequestException('Order is already cancelled');
    }
    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed order');
    }

    const cancellableSampleStatuses: SampleStatus[] = [
      SampleStatus.ORDERED,
      SampleStatus.COLLECTED,
    ];

    const hasProcessedSamples = order.samples.some(
      (s) => !cancellableSampleStatuses.includes(s.status),
    );
    if (hasProcessedSamples) {
      throw new BadRequestException('Cannot cancel order with samples in processing');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.labOrder.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
      });

      for (const sample of order.samples) {
        if (sample.status === SampleStatus.REJECTED) continue;

        this.sampleWorkflow.assertTransition(sample.status, SampleStatus.REJECTED);

        await tx.sample.update({
          where: { id: sample.id },
          data: {
            status: SampleStatus.REJECTED,
            rejectedAt: new Date(),
            rejectionReason: reason ?? 'Order cancelled',
          },
        });

        await tx.sampleEvent.create({
          data: {
            tenantId: ctx.tenantId,
            organizationId: ctx.organizationId,
            branchId: ctx.branchId,
            sampleId: sample.id,
            fromStatus: sample.status,
            toStatus: SampleStatus.REJECTED,
            eventType: SAMPLE_WORKFLOW_EVENT_TYPES.SAMPLE_REJECTED,
            notes: reason ?? 'Order cancelled',
            performedBy: ctx.userId,
          },
        });
      }

      return tx.labOrder.findUniqueOrThrow({
        where: { id: orderId },
        include: { items: true, samples: true },
      });
    });
  }

  async getOrder(ctx: LimsRequestContext, orderId: string) {
    const order = await this.prisma.labOrder.findFirst({
      where: { id: orderId, tenantId: ctx.tenantId },
      include: {
        items: { include: { test: true, package: true } },
        samples: { include: { events: { orderBy: { createdAt: 'desc' }, take: 5 } } },
        patient: { select: { id: true, uhid: true, firstName: true, lastName: true, phone: true } },
        reports: true,
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async listOrders(
    ctx: LimsRequestContext,
    filters: { patientId?: string; status?: string; search?: string; page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      ...(filters.patientId && { patientId: filters.patientId }),
      ...(filters.status && { status: filters.status as OrderStatus }),
      ...(filters.search && {
        OR: [
          { orderNumber: { contains: filters.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.labOrder.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          patient: { select: { id: true, uhid: true, firstName: true, lastName: true } },
          _count: { select: { samples: true, items: true } },
        },
      }),
      this.prisma.labOrder.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }
}
