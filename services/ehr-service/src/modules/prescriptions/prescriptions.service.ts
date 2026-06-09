import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { EhrSequenceService } from '@/services/ehr-sequence.service';
import type {
  CreatePrescriptionDto,
  ListPrescriptionsQueryDto,
} from './dto/prescriptions.dto';

@Injectable()
export class PrescriptionsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly sequence: EhrSequenceService,
  ) {}

  async create(ctx: ServiceRequestContext, dto: CreatePrescriptionDto) {
    if (!dto.lines.length) {
      throw new BadRequestException('Prescription must have at least one line');
    }

    const consultation = await this.prisma.consultation.findFirst({
      where: { id: dto.consultationId, tenantId: ctx.tenantId },
    });
    if (!consultation) throw new NotFoundException('Consultation not found');

    return this.prisma.prescription.create({
      data: {
        tenantId: ctx.tenantId,
        consultationId: dto.consultationId,
        doctorId: dto.doctorId,
        patientId: dto.patientId,
        prescriptionNumber: this.sequence.next('RX'),
        notes: dto.notes,
        lines: {
          create: dto.lines.map((line) => ({
            drugName: line.drugName,
            dosage: line.dosage,
            frequency: line.frequency,
            duration: line.duration,
            instructions: line.instructions,
          })),
        },
      },
      include: { lines: true, doctor: true },
    });
  }

  async get(ctx: ServiceRequestContext, prescriptionId: string) {
    const prescription = await this.prisma.prescription.findFirst({
      where: { id: prescriptionId, tenantId: ctx.tenantId },
      include: { lines: true, doctor: true, consultation: true },
    });
    if (!prescription) throw new NotFoundException('Prescription not found');
    return prescription;
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListPrescriptionsQueryDto & { page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.PrescriptionWhereInput = {
      tenantId: ctx.tenantId,
      ...(filters.patientId && { patientId: filters.patientId }),
      ...(filters.consultationId && { consultationId: filters.consultationId }),
    };

    const [items, total] = await Promise.all([
      this.prisma.prescription.findMany({
        where,
        skip,
        take,
        orderBy: { issuedAt: 'desc' },
        include: { lines: true, doctor: true },
      }),
      this.prisma.prescription.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }
}
