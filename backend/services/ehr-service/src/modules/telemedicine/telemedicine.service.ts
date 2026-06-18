import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TeleconsultStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { EhrSequenceService } from '@/services/ehr-sequence.service';
import type {
  EndTeleconsultDto,
  ListTeleconsultQueryDto,
  ScheduleTeleconsultDto,
} from './dto/telemedicine.dto';

@Injectable()
export class TelemedicineService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly sequence: EhrSequenceService,
  ) {}

  async schedule(ctx: ServiceRequestContext, dto: ScheduleTeleconsultDto) {
    const doctor = await this.prisma.ehrDoctor.findFirst({
      where: { id: dto.doctorId, tenantId: ctx.tenantId, isActive: true },
    });
    if (!doctor) throw new NotFoundException('Doctor not found');

    return this.prisma.teleconsultSession.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        patientId: dto.patientId,
        doctorId: dto.doctorId,
        sessionNumber: this.sequence.next('TEL'),
        scheduledAt: new Date(dto.scheduledAt),
        meetingUrl: dto.meetingUrl,
      },
    });
  }

  async get(ctx: ServiceRequestContext, sessionId: string) {
    const session = await this.prisma.teleconsultSession.findFirst({
      where: { id: sessionId, tenantId: ctx.tenantId },
    });
    if (!session) throw new NotFoundException('Teleconsult session not found');
    return session;
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListTeleconsultQueryDto & { page?: number; limit?: number },
  ) {
    const { skip, take, page, limit } = paginate(filters.page, filters.limit);
    const where: Prisma.TeleconsultSessionWhereInput = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      ...(filters.patientId && { patientId: filters.patientId }),
      ...(filters.doctorId && { doctorId: filters.doctorId }),
      ...(filters.status && { status: filters.status }),
    };

    const [items, total] = await Promise.all([
      this.prisma.teleconsultSession.findMany({
        where,
        skip,
        take,
        orderBy: { scheduledAt: 'asc' },
      }),
      this.prisma.teleconsultSession.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, limit) };
  }

  async start(ctx: ServiceRequestContext, sessionId: string) {
    const session = await this.get(ctx, sessionId);
    if (
      session.status !== TeleconsultStatus.SCHEDULED &&
      session.status !== TeleconsultStatus.WAITING
    ) {
      throw new BadRequestException('Session cannot be started');
    }

    return this.prisma.teleconsultSession.update({
      where: { id: sessionId },
      data: { status: TeleconsultStatus.IN_CALL, startedAt: new Date() },
    });
  }

  async end(ctx: ServiceRequestContext, sessionId: string, dto: EndTeleconsultDto) {
    const session = await this.get(ctx, sessionId);
    if (session.status !== TeleconsultStatus.IN_CALL) {
      throw new BadRequestException('Session is not in call');
    }

    return this.prisma.teleconsultSession.update({
      where: { id: sessionId },
      data: {
        status: TeleconsultStatus.COMPLETED,
        endedAt: new Date(),
        recordingUrl: dto.recordingUrl,
      },
    });
  }
}
