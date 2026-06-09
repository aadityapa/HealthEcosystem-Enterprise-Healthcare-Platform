import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CheckInDto, CheckOutDto } from './dto/attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async checkIn(ctx: ServiceRequestContext, dto: CheckInDto) {
    const employee = await this.prisma.employee.findFirst({
      where: { id: dto.employeeId, tenantId: ctx.tenantId },
    });
    if (!employee) throw new NotFoundException('Employee not found');

    const date = this.toDateOnly(dto.date ?? new Date().toISOString());

    const existing = await this.prisma.hrmsAttendance.findFirst({
      where: { employeeId: dto.employeeId, date },
    });
    if (existing?.checkIn) {
      throw new BadRequestException('Employee already checked in for this date');
    }

    if (existing) {
      return this.prisma.hrmsAttendance.update({
        where: { id: existing.id },
        data: { checkIn: new Date(), notes: dto.notes },
      });
    }

    return this.prisma.hrmsAttendance.create({
      data: {
        tenantId: ctx.tenantId,
        employeeId: dto.employeeId,
        date,
        checkIn: new Date(),
        notes: dto.notes,
        status: 'present',
      },
    });
  }

  async checkOut(ctx: ServiceRequestContext, dto: CheckOutDto) {
    const date = this.toDateOnly(dto.date ?? new Date().toISOString());

    const record = await this.prisma.hrmsAttendance.findFirst({
      where: {
        employeeId: dto.employeeId,
        date,
        tenantId: ctx.tenantId,
      },
    });
    if (!record) throw new NotFoundException('Attendance record not found');
    if (!record.checkIn) throw new BadRequestException('Employee has not checked in');
    if (record.checkOut) throw new BadRequestException('Employee already checked out');

    return this.prisma.hrmsAttendance.update({
      where: { id: record.id },
      data: { checkOut: new Date() },
    });
  }

  private toDateOnly(iso: string): Date {
    const d = new Date(iso);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  }
}
