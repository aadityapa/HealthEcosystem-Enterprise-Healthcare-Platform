import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, SampleStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { LimsRequestContext } from '@/common/context/lims-context';
import { SampleWorkflowService } from '@/services/sample-workflow.service';

function formatDatePart(date: Date): string {
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yy}${mm}${dd}`;
}

@Injectable()
export class ReportsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly sampleWorkflow: SampleWorkflowService,
  ) {}

  private async generateReportNumber(tenantId: string, branchCode: string): Promise<string> {
    const datePart = formatDatePart(new Date());
    const prefix = `RPT-${branchCode}-${datePart}`;
    const count = await this.prisma.report.count({
      where: {
        tenantId,
        reportNumber: { startsWith: prefix },
      },
    });
    return `${prefix}-${String(count + 1).padStart(5, '0')}`;
  }

  async generateReport(
    ctx: LimsRequestContext,
    sampleId: string,
    templateId?: string,
  ) {
    const sample = await this.prisma.sample.findFirst({
      where: { id: sampleId, tenantId: ctx.tenantId },
      include: {
        results: true,
        labOrder: true,
        reports: { where: { status: { not: 'void' } } },
      },
    });
    if (!sample) throw new NotFoundException('Sample not found');

    if (sample.status !== SampleStatus.APPROVED && sample.status !== SampleStatus.REPORTED) {
      throw new BadRequestException(
        `Report can only be generated for APPROVED samples (current: ${sample.status})`,
      );
    }

    const unapprovedResults = sample.results.filter((r) => r.status !== 'approved');
    if (unapprovedResults.length > 0) {
      throw new BadRequestException('All results must be approved before generating report');
    }

    const existingDraft = sample.reports.find((r) => r.status === 'draft');
    if (existingDraft) {
      return existingDraft;
    }

    const branch = await this.prisma.branch.findFirst({
      where: { id: ctx.branchId, tenantId: ctx.tenantId },
    });
    if (!branch) throw new NotFoundException('Branch not found');

    const reportNumber = await this.generateReportNumber(ctx.tenantId, branch.code);

    return this.prisma.report.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        sampleId,
        labOrderId: sample.labOrderId,
        reportNumber,
        status: 'draft',
        templateId,
      },
      include: {
        sample: {
          include: {
            results: { include: { parameter: true } },
            labOrderItem: { include: { test: true } },
          },
        },
        labOrder: {
          include: {
            patient: {
              select: { id: true, uhid: true, firstName: true, lastName: true, gender: true },
            },
          },
        },
      },
    });
  }

  async releaseReport(ctx: LimsRequestContext, reportId: string, notes?: string) {
    const report = await this.prisma.report.findFirst({
      where: { id: reportId, tenantId: ctx.tenantId },
      include: { sample: true },
    });
    if (!report) throw new NotFoundException('Report not found');

    if (report.status === 'released') {
      throw new BadRequestException('Report is already released');
    }
    if (report.status !== 'draft') {
      throw new BadRequestException(`Report must be in draft status (current: ${report.status})`);
    }

    const sample = report.sample;
    if (sample.status !== SampleStatus.APPROVED && sample.status !== SampleStatus.REPORTED) {
      throw new BadRequestException('Sample must be approved before report release');
    }

    return this.prisma.$transaction(async (tx) => {
      const pdfKey = `reports/${ctx.tenantId}/${report.reportNumber}.pdf`;

      const released = await tx.report.update({
        where: { id: reportId },
        data: {
          status: 'released',
          pdfS3Key: pdfKey,
          releasedAt: new Date(),
          releasedBy: ctx.userId,
        },
        include: {
          sample: { include: { results: { include: { parameter: true } } } },
          labOrder: true,
        },
      });

      if (sample.status === SampleStatus.APPROVED) {
        this.sampleWorkflow.assertTransition(sample.status, SampleStatus.REPORTED);

        await tx.sample.update({
          where: { id: sample.id },
          data: { status: SampleStatus.REPORTED },
        });

        await tx.sampleEvent.create({
          data: {
            tenantId: ctx.tenantId,
            organizationId: ctx.organizationId,
            branchId: ctx.branchId,
            sampleId: sample.id,
            fromStatus: SampleStatus.APPROVED,
            toStatus: SampleStatus.REPORTED,
            eventType: this.sampleWorkflow.eventTypeForTransition(SampleStatus.REPORTED),
            notes,
            performedBy: ctx.userId,
          },
        });
      }

      const orderSampleStatuses = await tx.sample.findMany({
        where: { labOrderId: report.labOrderId },
        select: { status: true },
      });

      const allReported = orderSampleStatuses.every(
        (s) => s.status === SampleStatus.REPORTED || s.status === SampleStatus.REJECTED,
      );

      if (allReported) {
        await tx.labOrder.update({
          where: { id: report.labOrderId },
          data: { status: OrderStatus.COMPLETED },
        });
      }

      return released;
    });
  }

  async getReport(ctx: LimsRequestContext, reportId: string) {
    const report = await this.prisma.report.findFirst({
      where: { id: reportId, tenantId: ctx.tenantId },
      include: {
        sample: {
          include: {
            results: { include: { parameter: true } },
            labOrderItem: { include: { test: true } },
          },
        },
        labOrder: {
          include: {
            patient: {
              select: { id: true, uhid: true, firstName: true, lastName: true },
            },
          },
        },
      },
    });
    if (!report) throw new NotFoundException('Report not found');
    return report;
  }

  async listReports(
    ctx: LimsRequestContext,
    filters: { labOrderId?: string; sampleId?: string; status?: string; page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      ...(filters.labOrderId && { labOrderId: filters.labOrderId }),
      ...(filters.sampleId && { sampleId: filters.sampleId }),
      ...(filters.status && { status: filters.status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          sample: { select: { barcode: true, sampleNumber: true } },
          labOrder: { select: { orderNumber: true } },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }
}
