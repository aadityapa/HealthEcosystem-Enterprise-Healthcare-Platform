import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SampleStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { LimsRequestContext } from '@/common/context/lims-context';
import { SampleWorkflowService } from '@/services/sample-workflow.service';
import type {
  CollectSampleDto,
  ReceiveSampleDto,
  ProcessSampleDto,
  RejectSampleDto,
} from './dto/samples.dto';

@Injectable()
export class SamplesService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly sampleWorkflow: SampleWorkflowService,
  ) {}

  private async getSampleOrThrow(ctx: LimsRequestContext, sampleId: string) {
    const sample = await this.prisma.sample.findFirst({
      where: { id: sampleId, tenantId: ctx.tenantId },
    });
    if (!sample) throw new NotFoundException('Sample not found');
    return sample;
  }

  private async transitionSample(
    ctx: LimsRequestContext,
    sampleId: string,
    toStatus: SampleStatus,
    data: Record<string, unknown>,
    notes?: string,
  ) {
    const sample = await this.getSampleOrThrow(ctx, sampleId);
    this.sampleWorkflow.assertTransition(sample.status, toStatus);

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.sample.update({
        where: { id: sampleId },
        data: { status: toStatus, ...data },
        include: {
          labOrder: { select: { orderNumber: true } },
          labOrderItem: { include: { test: true } },
        },
      });

      await tx.sampleEvent.create({
        data: {
          tenantId: ctx.tenantId,
          organizationId: ctx.organizationId,
          branchId: ctx.branchId,
          sampleId,
          fromStatus: sample.status,
          toStatus,
          eventType: this.sampleWorkflow.eventTypeForTransition(toStatus),
          notes,
          performedBy: ctx.userId,
        },
      });

      return updated;
    });
  }

  collectSample(ctx: LimsRequestContext, sampleId: string, dto: CollectSampleDto) {
    return this.transitionSample(
      ctx,
      sampleId,
      SampleStatus.COLLECTED,
      {
        collectedBy: dto.collectedBy ?? ctx.userId,
        collectedAt: new Date(),
        ...(dto.storageLocation && { storageLocation: dto.storageLocation }),
      },
      dto.notes,
    );
  }

  receiveSample(ctx: LimsRequestContext, sampleId: string, dto: ReceiveSampleDto) {
    return this.transitionSample(
      ctx,
      sampleId,
      SampleStatus.RECEIVED,
      {
        receivedAt: new Date(),
        processingBranchId: dto.processingBranchId ?? ctx.branchId,
        ...(dto.storageLocation && { storageLocation: dto.storageLocation }),
      },
      dto.notes,
    );
  }

  processSample(ctx: LimsRequestContext, sampleId: string, dto: ProcessSampleDto) {
    return this.transitionSample(
      ctx,
      sampleId,
      SampleStatus.PROCESSING,
      { processedAt: new Date() },
      dto.notes,
    );
  }

  rejectSample(ctx: LimsRequestContext, sampleId: string, dto: RejectSampleDto) {
    if (!dto.reason?.trim()) {
      throw new BadRequestException('Rejection reason is required');
    }

    return this.transitionSample(
      ctx,
      sampleId,
      SampleStatus.REJECTED,
      {
        rejectedAt: new Date(),
        rejectionReason: dto.reason,
      },
      dto.reason,
    );
  }

  async getSample(ctx: LimsRequestContext, sampleId: string) {
    const sample = await this.prisma.sample.findFirst({
      where: { id: sampleId, tenantId: ctx.tenantId },
      include: {
        labOrder: { select: { id: true, orderNumber: true, status: true } },
        labOrderItem: { include: { test: true } },
        events: { orderBy: { createdAt: 'desc' }, take: 10 },
        results: { include: { parameter: true } },
      },
    });
    if (!sample) throw new NotFoundException('Sample not found');
    return sample;
  }

  async getSampleByBarcode(ctx: LimsRequestContext, barcode: string) {
    const sample = await this.prisma.sample.findFirst({
      where: { barcode, tenantId: ctx.tenantId },
      include: {
        labOrder: { select: { id: true, orderNumber: true, patientId: true } },
        labOrderItem: { include: { test: true } },
        events: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    });
    if (!sample) throw new NotFoundException(`Sample with barcode ${barcode} not found`);
    return sample;
  }

  async listSamples(
    ctx: LimsRequestContext,
    filters: { labOrderId?: string; status?: string; search?: string; page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where = {
      tenantId: ctx.tenantId,
      ...(filters.labOrderId && { labOrderId: filters.labOrderId }),
      ...(filters.status && { status: filters.status as SampleStatus }),
      ...(filters.search && {
        OR: [
          { barcode: { contains: filters.search, mode: 'insensitive' as const } },
          { sampleNumber: { contains: filters.search, mode: 'insensitive' as const } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.sample.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          labOrder: { select: { orderNumber: true } },
          labOrderItem: { select: { itemName: true } },
        },
      }),
      this.prisma.sample.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async getSampleEvents(ctx: LimsRequestContext, sampleId: string) {
    await this.getSampleOrThrow(ctx, sampleId);
    return this.prisma.sampleEvent.findMany({
      where: { sampleId, tenantId: ctx.tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
