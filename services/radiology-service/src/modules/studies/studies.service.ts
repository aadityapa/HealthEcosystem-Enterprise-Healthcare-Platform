import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, StudyStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreateStudyDto,
  ListStudiesQueryDto,
  ScheduleStudyDto,
  UpdateStudyDto,
} from './dto/studies.dto';

@Injectable()
export class StudiesService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateStudyDto) {
    const existing = await this.prisma.radiologyStudy.findFirst({
      where: {
        tenantId: ctx.tenantId,
        OR: [{ studyUid: dto.studyUid }, { accessionNumber: dto.accessionNumber }],
      },
    });
    if (existing) {
      throw new ConflictException('Study UID or accession number already exists');
    }

    return this.prisma.radiologyStudy.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        patientId: dto.patientId,
        studyUid: dto.studyUid,
        accessionNumber: dto.accessionNumber,
        modality: dto.modality,
        bodyPart: dto.bodyPart,
        description: dto.description,
        status: dto.scheduledAt ? StudyStatus.SCHEDULED : StudyStatus.SCHEDULED,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        referringDoctor: dto.referringDoctor,
        pacsNodeId: dto.pacsNodeId,
      },
    });
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListStudiesQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where: Prisma.RadiologyStudyWhereInput = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      ...(filters.patientId && { patientId: filters.patientId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.modality && { modality: filters.modality }),
    };

    const [items, total] = await Promise.all([
      this.prisma.radiologyStudy.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.radiologyStudy.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const study = await this.prisma.radiologyStudy.findFirst({
      where: { id, tenantId: ctx.tenantId },
      include: { series: { include: { instances: true } }, report: true },
    });
    if (!study) throw new NotFoundException('Radiology study not found');
    return study;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateStudyDto) {
    await this.getById(ctx, id);
    return this.prisma.radiologyStudy.update({
      where: { id },
      data: dto,
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    const study = await this.getById(ctx, id);
    if (study.status === StudyStatus.IN_PROGRESS) {
      throw new BadRequestException('Cannot delete study in progress');
    }
    await this.prisma.radiologyStudy.delete({ where: { id } });
    return { deleted: true };
  }

  async schedule(ctx: ServiceRequestContext, id: string, dto: ScheduleStudyDto) {
    await this.getById(ctx, id);
    return this.prisma.radiologyStudy.update({
      where: { id },
      data: {
        status: StudyStatus.SCHEDULED,
        scheduledAt: new Date(dto.scheduledAt),
      },
    });
  }

  async perform(ctx: ServiceRequestContext, id: string) {
    const study = await this.getById(ctx, id);
    if (study.status === StudyStatus.COMPLETED || study.status === StudyStatus.REPORTED) {
      throw new BadRequestException('Study already completed or reported');
    }
    return this.prisma.radiologyStudy.update({
      where: { id },
      data: {
        status: StudyStatus.IN_PROGRESS,
        performedAt: new Date(),
      },
    });
  }

  async complete(ctx: ServiceRequestContext, id: string) {
    const study = await this.getById(ctx, id);
    if (study.status !== StudyStatus.IN_PROGRESS) {
      throw new BadRequestException('Study must be in progress to complete');
    }
    return this.prisma.radiologyStudy.update({
      where: { id },
      data: { status: StudyStatus.COMPLETED },
    });
  }
}
