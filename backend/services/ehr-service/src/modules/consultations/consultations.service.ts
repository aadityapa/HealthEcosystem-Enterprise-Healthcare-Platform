import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConsultationStatus, Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { EhrSequenceService } from '@/services/ehr-sequence.service';
import type {
  AddClinicalNoteDto,
  CompleteConsultationDto,
  CreateConsultationDto,
  ListConsultationsQueryDto,
} from './dto/consultations.dto';

@Injectable()
export class ConsultationsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly sequence: EhrSequenceService,
  ) {}

  async create(ctx: ServiceRequestContext, dto: CreateConsultationDto) {
    const doctor = await this.prisma.ehrDoctor.findFirst({
      where: { id: dto.doctorId, tenantId: ctx.tenantId, isActive: true },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.prisma.consultation.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        appointmentId: dto.appointmentId,
        consultationNumber: this.sequence.next('CON'),
        chiefComplaint: dto.chiefComplaint,
      },
      include: { doctor: true, clinicalNotes: true },
    });
  }

  async get(ctx: ServiceRequestContext, consultationId: string) {
    const consultation = await this.prisma.consultation.findFirst({
      where: { id: consultationId, tenantId: ctx.tenantId },
      include: { doctor: true, clinicalNotes: { orderBy: { createdAt: 'asc' } } },
    });
    if (!consultation) throw new NotFoundException('Consultation not found');
    return consultation;
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListConsultationsQueryDto & { page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.ConsultationWhereInput = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      ...(filters.patientId && { patientId: filters.patientId }),
      ...(filters.doctorId && { doctorId: filters.doctorId }),
      ...(filters.status && { status: filters.status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.consultation.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { doctor: true },
      }),
      this.prisma.consultation.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async start(ctx: ServiceRequestContext, consultationId: string) {
    const consultation = await this.get(ctx, consultationId);
    if (consultation.status !== ConsultationStatus.SCHEDULED) {
      throw new BadRequestException('Consultation cannot be started');
    }

    return this.prisma.consultation.update({
      where: { id: consultationId },
      data: { status: ConsultationStatus.IN_PROGRESS, startedAt: new Date() },
      include: { doctor: true, clinicalNotes: true },
    });
  }

  async complete(
    ctx: ServiceRequestContext,
    consultationId: string,
    dto: CompleteConsultationDto,
  ) {
    const consultation = await this.get(ctx, consultationId);
    if (consultation.status !== ConsultationStatus.IN_PROGRESS) {
      throw new BadRequestException('Consultation is not in progress');
    }

    return this.prisma.consultation.update({
      where: { id: consultationId },
      data: {
        status: ConsultationStatus.COMPLETED,
        diagnosis: dto.diagnosis,
        completedAt: new Date(),
      },
      include: { doctor: true, clinicalNotes: true },
    });
  }

  async addClinicalNote(
    ctx: ServiceRequestContext,
    consultationId: string,
    dto: AddClinicalNoteDto,
  ) {
    await this.get(ctx, consultationId);

    return this.prisma.clinicalNote.create({
      data: {
        consultationId,
        noteType: dto.noteType,
        content: dto.content,
        authoredBy: ctx.userId,
      },
    });
  }
}
