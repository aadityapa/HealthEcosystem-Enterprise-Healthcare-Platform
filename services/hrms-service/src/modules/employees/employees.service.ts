import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreateEmployeeDto,
  ListEmployeesQueryDto,
  UpdateEmployeeDto,
} from './dto/employees.dto';

@Injectable()
export class EmployeesService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateEmployeeDto) {
    const existing = await this.prisma.employee.findFirst({
      where: { tenantId: ctx.tenantId, employeeCode: dto.employeeCode },
    });
    if (existing) throw new ConflictException('Employee code already exists');

    return this.prisma.employee.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        employeeCode: dto.employeeCode,
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        department: dto.department,
        designation: dto.designation,
        joinDate: new Date(dto.joinDate),
        userId: dto.userId,
        salary: dto.salary,
      },
    });
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListEmployeesQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where: Prisma.EmployeeWhereInput = {
      tenantId: ctx.tenantId,
      branchId: ctx.branchId,
      ...(filters.status && { status: filters.status }),
      ...(filters.department && { department: filters.department }),
    };

    const [items, total] = await Promise.all([
      this.prisma.employee.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.employee.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const employee = await this.prisma.employee.findFirst({
      where: { id, tenantId: ctx.tenantId },
    });
    if (!employee) throw new NotFoundException('Employee not found');
    return employee;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateEmployeeDto) {
    await this.getById(ctx, id);
    return this.prisma.employee.update({ where: { id }, data: dto });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);
    await this.prisma.employee.delete({ where: { id } });
    return { deleted: true };
  }
}
