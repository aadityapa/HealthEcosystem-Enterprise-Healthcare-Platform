import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AppointmentStatus, Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { EhrSequenceService } from '@/services/ehr-sequence.service';
import type {
  CancelAppointmentDto,
  CreateAppointmentDto,
  ListAppointmentsQueryDto,
} from './dto/appointments.dto';

@Injectable()
export class AppointmentsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly sequence: EhrSequenceService,
  ) {}

  async create(ctx: ServiceRequestContext, dto: CreateAppointmentDto) {
    const doctor = await this.prisma.ehrDoctor.findFirst({
      where: { id: dto.doctorId, tenantId: ctx.tenantId, isActive: true },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.prisma.appointment.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        appointmentNumber: this.sequence.next('APT'),
        scheduledAt: new Date(dto.scheduledAt),
        durationMins: dto.durationMins ?? 15,
        reason: dto.reason,
        notes: dto.notes,
      },
      include: { doctor: true },
    });
  }

  async get(ctx: ServiceRequestContext, appointmentId: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id: appointmentId, tenantId: ctx.tenantId },
      include: { doctor: true },
    });
    if (!appointment) throw new NotFoundException('Appointment not found');
    return appointment;
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListAppointmentsQueryDto & { page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.AppointmentWhereInput = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      ...(filters.patientId && { patientId: filters.patientId }),
      ...(filters.doctorId && { doctorId: filters.doctorId }),
      ...(filters.status && { status: filters.status }),
      ...(filters.from || filters.to
        ? {
            scheduledAt: {
              ...(filters.from && { gte: new Date(filters.from) }),
              ...(filters.to && { lte: new Date(filters.to) }),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take,
        orderBy: { scheduledAt: 'asc' },
        include: { doctor: true },
      }),
      this.prisma.appointment.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async checkIn(ctx: ServiceRequestContext, appointmentId: string) {
    const appointment = await this.get(ctx, appointmentId);
    if (
      appointment.status !== AppointmentStatus.SCHEDULED &&
      appointment.status !== AppointmentStatus.CONFIRMED
    ) {
      throw new BadRequestException('Appointment cannot be checked in');
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: AppointmentStatus.CHECKED_IN },
      include: { doctor: true },
    });
  }

  async cancel(
    ctx: ServiceRequestContext,
    appointmentId: string,
    dto: CancelAppointmentDto,
  ) {
    const appointment = await this.get(ctx, appointmentId);
    if (appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Appointment is already cancelled');
    }
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Completed appointments cannot be cancelled');
    }

    return this.prisma.appointment.update({
      where: { id: appointmentId },
      data: {
        status: AppointmentStatus.CANCELLED,
        notes: dto.reason ?? appointment.notes,
      },
      include: { doctor: true },
    });
  }
}
