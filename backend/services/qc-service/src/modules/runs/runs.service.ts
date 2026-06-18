import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { QcRunStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { WestgardRulesService } from '@/services/westgard-rules.service';
import type {
  CreateQcRunDto,
  ListRunsQueryDto,
  RecordDataPointDto,
} from './dto/runs.dto';

const REJECT_RULES = new Set(['1-3s', '2-2s', 'R-4s', '4-1s', '10x']);

@Injectable()
export class RunsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly westgardRules: WestgardRulesService,
  ) {}

  async create(ctx: ServiceRequestContext, dto: CreateQcRunDto) {
    const material = await this.prisma.qcMaterial.findFirst({
      where: { id: dto.materialId, tenantId: ctx.tenantId },
    });
    if (!material) throw new NotFoundException('QC material not found');

    const runNumber = dto.runNumber ?? (await this.nextRunNumber(ctx.tenantId));

    return this.prisma.qcRun.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        materialId: dto.materialId,
        deviceId: dto.deviceId,
        runNumber,
        status: QcRunStatus.IN_PROGRESS,
        operatorId: ctx.userId,
        notes: dto.notes,
      },
      include: { material: true },
    });
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListRunsQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      ...(filters.materialId ? { materialId: filters.materialId } : {}),
      ...(filters.status ? { status: filters.status } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.qcRun.findMany({
        where,
        skip,
        take,
        orderBy: { runAt: 'desc' },
        include: {
          material: { select: { code: true, name: true, analyte: true } },
          _count: { select: { dataPoints: true, violations: true } },
        },
      }),
      this.prisma.qcRun.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const run = await this.prisma.qcRun.findFirst({
      where: { id, tenantId: ctx.tenantId },
      include: {
        material: true,
        dataPoints: { orderBy: { recordedAt: 'asc' } },
        violations: { orderBy: { detectedAt: 'desc' } },
        failures: true,
      },
    });
    if (!run) throw new NotFoundException('QC run not found');
    return run;
  }

  async recordDataPoint(
    ctx: ServiceRequestContext,
    runId: string,
    dto: RecordDataPointDto,
  ) {
    const run = await this.prisma.qcRun.findFirst({
      where: { id: runId, tenantId: ctx.tenantId },
      include: { material: true },
    });
    if (!run) throw new NotFoundException('QC run not found');
    if (run.status === QcRunStatus.REJECTED || run.status === QcRunStatus.FAILED) {
      throw new BadRequestException('Cannot record data points on a failed or rejected run');
    }

    const mean = Number(run.material.targetMean);
    const sd = Number(run.material.targetSd);
    const zScore = this.westgardRules.calculateZScore(dto.value, mean, sd);

    const priorPoints = await this.prisma.qcDataPoint.findMany({
      where: {
        run: {
          tenantId: ctx.tenantId,
          materialId: run.materialId,
        },
      },
      orderBy: { recordedAt: 'desc' },
      take: 9,
      select: { zScore: true },
    });

    const historicalZScores = priorPoints
      .reverse()
      .map((p) => Number(p.zScore ?? 0));
    const allZScores = [...historicalZScores, zScore];
    const violations = this.westgardRules.evaluate(allZScores);
    const hasReject = violations.some((v) => REJECT_RULES.has(v.ruleCode));

    const dataPoint = await this.prisma.qcDataPoint.create({
      data: {
        runId,
        value: dto.value,
        zScore,
        isOutlier: hasReject || Math.abs(zScore) > 2,
        recordedAt: dto.recordedAt ? new Date(dto.recordedAt) : undefined,
      },
    });

    if (violations.length > 0) {
      await this.prisma.westgardViolation.createMany({
        data: violations.map((v) => ({
          runId,
          ruleCode: v.ruleCode,
          description: v.description,
          severity: v.severity,
        })),
      });
    }

    let failure = null;
    if (hasReject) {
      await this.prisma.qcRun.update({
        where: { id: runId },
        data: { status: QcRunStatus.FAILED },
      });

      failure = await this.prisma.qcFailure.create({
        data: {
          tenantId: ctx.tenantId,
          runId,
          failureType: 'WESTGARD',
          description: `Westgard rule violation(s): ${violations.map((v) => v.ruleCode).join(', ')}`,
        },
      });
    } else if (run.status === QcRunStatus.IN_PROGRESS || run.status === QcRunStatus.PENDING) {
      await this.prisma.qcRun.update({
        where: { id: runId },
        data: { status: QcRunStatus.PASSED },
      });
    }

    return {
      dataPoint,
      zScore,
      violations,
      failure,
    };
  }

  private async nextRunNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.qcRun.count({ where: { tenantId } });
    const seq = String(count + 1).padStart(6, '0');
    return `QC-${seq}`;
  }
}
