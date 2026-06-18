import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EmploymentStatus, PayrollStatus, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreatePayrollRunDto } from './dto/payroll.dto';

@Injectable()
export class PayrollService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async createRun(ctx: ServiceRequestContext, dto: CreatePayrollRunDto) {
    const runNumber = dto.runNumber ?? (await this.nextRunNumber(ctx.tenantId));

    return this.prisma.payrollRun.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        runNumber,
        periodMonth: dto.periodMonth,
        periodYear: dto.periodYear,
        status: PayrollStatus.DRAFT,
      },
    });
  }

  async processRun(ctx: ServiceRequestContext, runId: string) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { id: runId, tenantId: ctx.tenantId },
    });
    if (!run) throw new NotFoundException('Payroll run not found');
    if (run.status !== PayrollStatus.DRAFT) {
      throw new BadRequestException('Only draft payroll runs can be processed');
    }

    const employees = await this.prisma.employee.findMany({
      where: {
        tenantId: ctx.tenantId,
        branchId: ctx.branchId,
        status: EmploymentStatus.ACTIVE,
        salary: { not: null },
      },
    });

    const lines = employees.map((emp) => {
      const basic = Number(emp.salary ?? 0);
      const allowances = 0;
      const deductions = 0;
      const netPay = basic + allowances - deductions;
      return {
        payrollRunId: runId,
        employeeId: emp.id,
        basicSalary: basic,
        allowances,
        deductions,
        netPay,
      };
    });

    const totalAmount = lines.reduce((sum, line) => sum + line.netPay, 0);

    await this.prisma.payrollLine.deleteMany({ where: { payrollRunId: runId } });
    if (lines.length > 0) {
      await this.prisma.payrollLine.createMany({ data: lines });
    }

    return this.prisma.payrollRun.update({
      where: { id: runId },
      data: {
        status: PayrollStatus.PROCESSED,
        totalAmount,
        processedAt: new Date(),
      },
      include: { lines: { include: { employee: true } } },
    });
  }

  async getLines(ctx: ServiceRequestContext, runId: string) {
    const run = await this.prisma.payrollRun.findFirst({
      where: { id: runId, tenantId: ctx.tenantId },
    });
    if (!run) throw new NotFoundException('Payroll run not found');

    return this.prisma.payrollLine.findMany({
      where: { payrollRunId: runId },
      include: {
        employee: {
          select: { employeeCode: true, firstName: true, lastName: true },
        },
      },
    });
  }

  private async nextRunNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.payrollRun.count({ where: { tenantId } });
    return `PAY-${String(count + 1).padStart(6, '0')}`;
  }
}
