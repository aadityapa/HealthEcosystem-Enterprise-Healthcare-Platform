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
import {
  ResultValidationService,
  type ReferenceRange,
} from '@/services/result-validation.service';
import { SampleWorkflowService } from '@/services/sample-workflow.service';
import type { EnterResultsDto } from './dto/results.dto';

@Injectable()
export class ResultsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly resultValidation: ResultValidationService,
    private readonly sampleWorkflow: SampleWorkflowService,
  ) {}

  async enterResults(ctx: LimsRequestContext, sampleId: string, dto: EnterResultsDto) {
    const sample = await this.prisma.sample.findFirst({
      where: { id: sampleId, tenantId: ctx.tenantId },
      include: {
        labOrder: { include: { patient: true } },
        labOrderItem: { include: { test: { include: { parameters: true } } } },
      },
    });
    if (!sample) throw new NotFoundException('Sample not found');

    if (
      sample.status !== SampleStatus.PROCESSING &&
      sample.status !== SampleStatus.RESULT_PENDING
    ) {
      throw new BadRequestException(
        `Results can only be entered when sample is PROCESSING or RESULT_PENDING (current: ${sample.status})`,
      );
    }

    if (!dto.results?.length) {
      throw new BadRequestException('At least one result is required');
    }

    const test = sample.labOrderItem.test;
    if (!test) {
      throw new BadRequestException('Sample is not linked to a test');
    }

    const patient = sample.labOrder.patient;
    const ageYears = patient.dateOfBirth
      ? Math.floor(
          (Date.now() - patient.dateOfBirth.getTime()) / (365.25 * 24 * 60 * 60 * 1000),
        )
      : undefined;

    const referenceRanges = (test.referenceRanges as ReferenceRange[]) ?? [];

    return this.prisma.$transaction(async (tx) => {
      const savedResults = [];

      for (const entry of dto.results) {
        const parameter = test.parameters.find((p) => p.id === entry.parameterId);
        if (!parameter) {
          throw new BadRequestException(`Parameter ${entry.parameterId} not found for test`);
        }

        const validation = this.resultValidation.validate({
          value: entry.value,
          dataType: parameter.dataType,
          referenceRanges,
          gender: patient.gender,
          ageYears,
        });

        const result = await tx.sampleResult.upsert({
          where: {
            sampleId_parameterId: {
              sampleId,
              parameterId: entry.parameterId,
            },
          },
          create: {
            tenantId: ctx.tenantId,
            organizationId: ctx.organizationId,
            branchId: ctx.branchId,
            sampleId,
            parameterId: entry.parameterId,
            value: entry.value,
            unit: entry.unit ?? parameter.unit,
            flag: validation.flag,
            status: 'entered',
            referenceRange: validation.referenceRange,
            deviceId: entry.deviceId,
            rawValue: entry.rawValue,
          },
          update: {
            value: entry.value,
            unit: entry.unit ?? parameter.unit,
            flag: validation.flag,
            status: 'entered',
            referenceRange: validation.referenceRange,
            deviceId: entry.deviceId,
            rawValue: entry.rawValue,
            verifiedBy: null,
            verifiedAt: null,
            approvedBy: null,
            approvedAt: null,
          },
          include: { parameter: true },
        });

        savedResults.push(result);
      }

      if (sample.status === SampleStatus.PROCESSING) {
        this.sampleWorkflow.assertTransition(sample.status, SampleStatus.RESULT_PENDING);

        await tx.sample.update({
          where: { id: sampleId },
          data: { status: SampleStatus.RESULT_PENDING },
        });

        await tx.sampleEvent.create({
          data: {
            tenantId: ctx.tenantId,
            organizationId: ctx.organizationId,
            branchId: ctx.branchId,
            sampleId,
            fromStatus: sample.status,
            toStatus: SampleStatus.RESULT_PENDING,
            eventType: this.sampleWorkflow.eventTypeForTransition(SampleStatus.RESULT_PENDING),
            notes: dto.notes,
            performedBy: ctx.userId,
          },
        });
      }

      return savedResults;
    });
  }

  async verifyResult(ctx: LimsRequestContext, resultId: string, notes?: string) {
    const result = await this.prisma.sampleResult.findFirst({
      where: { id: resultId, tenantId: ctx.tenantId },
      include: { sample: true },
    });
    if (!result) throw new NotFoundException('Result not found');

    if (result.status !== 'entered') {
      throw new BadRequestException(`Result must be in entered status (current: ${result.status})`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.sampleResult.update({
        where: { id: resultId },
        data: {
          status: 'verified',
          verifiedBy: ctx.userId,
          verifiedAt: new Date(),
        },
        include: { parameter: true, sample: true },
      });

      const pendingCount = await tx.sampleResult.count({
        where: { sampleId: result.sampleId, status: { in: ['entered', 'pending'] } },
      });

      if (pendingCount === 0 && result.sample.status === SampleStatus.RESULT_PENDING) {
        this.sampleWorkflow.assertTransition(
          result.sample.status,
          SampleStatus.VERIFIED,
        );

        await tx.sample.update({
          where: { id: result.sampleId },
          data: { status: SampleStatus.VERIFIED, verifiedAt: new Date() },
        });

        await tx.sampleEvent.create({
          data: {
            tenantId: ctx.tenantId,
            organizationId: ctx.organizationId,
            branchId: ctx.branchId,
            sampleId: result.sampleId,
            fromStatus: SampleStatus.RESULT_PENDING,
            toStatus: SampleStatus.VERIFIED,
            eventType: this.sampleWorkflow.eventTypeForTransition(SampleStatus.VERIFIED),
            notes,
            performedBy: ctx.userId,
          },
        });
      }

      return updated;
    });
  }

  async approveResult(ctx: LimsRequestContext, resultId: string, notes?: string) {
    const result = await this.prisma.sampleResult.findFirst({
      where: { id: resultId, tenantId: ctx.tenantId },
      include: { sample: true },
    });
    if (!result) throw new NotFoundException('Result not found');

    if (result.status !== 'verified') {
      throw new BadRequestException(`Result must be verified before approval (current: ${result.status})`);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.sampleResult.update({
        where: { id: resultId },
        data: {
          status: 'approved',
          approvedBy: ctx.userId,
          approvedAt: new Date(),
        },
        include: { parameter: true, sample: true },
      });

      const unapprovedCount = await tx.sampleResult.count({
        where: { sampleId: result.sampleId, status: { not: 'approved' } },
      });

      if (unapprovedCount === 0 && result.sample.status === SampleStatus.VERIFIED) {
        this.sampleWorkflow.assertTransition(result.sample.status, SampleStatus.APPROVED);

        await tx.sample.update({
          where: { id: result.sampleId },
          data: { status: SampleStatus.APPROVED, approvedAt: new Date() },
        });

        await tx.sampleEvent.create({
          data: {
            tenantId: ctx.tenantId,
            organizationId: ctx.organizationId,
            branchId: ctx.branchId,
            sampleId: result.sampleId,
            fromStatus: SampleStatus.VERIFIED,
            toStatus: SampleStatus.APPROVED,
            eventType: this.sampleWorkflow.eventTypeForTransition(SampleStatus.APPROVED),
            notes,
            performedBy: ctx.userId,
          },
        });
      }

      return updated;
    });
  }

  async listPendingResults(
    ctx: LimsRequestContext,
    filters: { branchId?: string; page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const branchId = filters.branchId ?? ctx.branchId;

    const where = {
      tenantId: ctx.tenantId,
      branchId,
      status: { in: ['entered', 'pending'] },
    };

    const [items, total] = await Promise.all([
      this.prisma.sampleResult.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'asc' },
        include: {
          parameter: true,
          sample: {
            include: {
              labOrder: { select: { orderNumber: true } },
              labOrderItem: { select: { itemName: true } },
            },
          },
        },
      }),
      this.prisma.sampleResult.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async getSampleResults(ctx: LimsRequestContext, sampleId: string) {
    const sample = await this.prisma.sample.findFirst({
      where: { id: sampleId, tenantId: ctx.tenantId },
    });
    if (!sample) throw new NotFoundException('Sample not found');

    return this.prisma.sampleResult.findMany({
      where: { sampleId, tenantId: ctx.tenantId },
      include: { parameter: true },
      orderBy: { parameter: { sortOrder: 'asc' } },
    });
  }
}
