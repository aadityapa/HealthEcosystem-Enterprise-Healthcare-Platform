import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { AssignShiftDto, CreateShiftDto, UpdateShiftDto } from './dto/shifts.dto';

@Injectable()
export class ShiftsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateShiftDto) {
    return this.prisma.shift.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        name: dto.name,
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async list(ctx: ServiceRequestContext, page = 1, limit = 20) {
    const { skip, take } = paginate(page, limit);
    const where = { tenantId: ctx.tenantId };

    const [items, total] = await Promise.all([
      this.prisma.shift.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.shift.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!shift) throw new NotFoundException('Shift not found');
    return shift;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateShiftDto) {
    await this.getById(ctx, id);
    return this.prisma.shift.update({ where: { id }, data: dto });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.shift.delete({ where: { id } });
    return { deleted: true };
  }

  async assign(ctx: ServiceRequestContext, dto: AssignShiftDto) {
    const [employee, shift] = await Promise.all([
      this.prisma.employee.findFirst({
        where: { id: dto.employeeId, tenantId: ctx.tenantId },
      }),
      this.prisma.shift.findFirst({
        where: { id: dto.shiftId, tenantId: ctx.tenantId },
      }),
    ]);
    if (!employee) throw new NotFoundException('Employee not found');
    if (!shift) throw new NotFoundException('Shift not found');

    const date = new Date(dto.date);
    const existing = await this.prisma.shiftAssignment.findFirst({
      where: { employeeId: dto.employeeId, date },
    });
    if (existing) {
      throw new ConflictException('Employee already has a shift assignment for this date');
    }

    return this.prisma.shiftAssignment.create({
      data: {
        employeeId: dto.employeeId,
        shiftId: dto.shiftId,
        date,
      },
      include: { shift: true, employee: true },
    });
  }
}
