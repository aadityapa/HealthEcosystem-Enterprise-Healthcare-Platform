import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StudyStatus, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateReportDto, ReleaseReportDto, VerifyReportDto } from './dto/reports.dto';

@Injectable()
export class ReportsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, studyId: string, dto: CreateReportDto) {
    const study = await this.prisma.radiologyStudy.findFirst({
      where: { id: studyId, tenantId: ctx.tenantId },
      include: { report: true },
    });
    if (!study) throw new NotFoundException('Radiology study not found');
    if (study.report) throw new ConflictException('Report already exists for study');
    if (study.status !== StudyStatus.COMPLETED && study.status !== StudyStatus.IN_PROGRESS) {
      throw new BadRequestException('Study must be completed or in progress to create report');
    }

    return this.prisma.radiologyReport.create({
      data: {
        studyId,
        reportNumber: dto.reportNumber,
        findings: dto.findings,
        impression: dto.impression,
        reportedBy: ctx.userId,
        reportedAt: new Date(),
      },
    });
  }

  async getByStudy(ctx: ServiceRequestContext, studyId: string) {
    const report = await this.prisma.radiologyReport.findFirst({
      where: { studyId, study: { tenantId: ctx.tenantId } },
    });
    if (!report) throw new NotFoundException('Radiology report not found');
    return report;
  }

  async verify(ctx: ServiceRequestContext, reportId: string, dto: VerifyReportDto) {
    const report = await this.prisma.radiologyReport.findFirst({
      where: { id: reportId, study: { tenantId: ctx.tenantId } },
    });
    if (!report) throw new NotFoundException('Radiology report not found');
    if (report.verifiedAt) throw new BadRequestException('Report already verified');

    return this.prisma.radiologyReport.update({
      where: { id: reportId },
      data: {
        findings: dto.findings ?? report.findings,
        impression: dto.impression ?? report.impression,
        verifiedBy: ctx.userId,
        verifiedAt: new Date(),
      },
    });
  }

  async release(ctx: ServiceRequestContext, reportId: string, dto: ReleaseReportDto) {
    const report = await this.prisma.radiologyReport.findFirst({
      where: { id: reportId, study: { tenantId: ctx.tenantId } },
      include: { study: true },
    });
    if (!report) throw new NotFoundException('Radiology report not found');
    if (!report.verifiedAt) {
      throw new BadRequestException('Report must be verified before release');
    }

    const [updatedReport] = await this.prisma.$transaction([
      this.prisma.radiologyReport.update({
        where: { id: reportId },
        data: { pdfS3Key: dto.pdfS3Key },
      }),
      this.prisma.radiologyStudy.update({
        where: { id: report.studyId },
        data: { status: StudyStatus.REPORTED },
      }),
    ]);

    return updatedReport;
  }
}
