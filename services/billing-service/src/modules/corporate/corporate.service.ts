import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import { toNumber, round2 } from '@/common/utils/decimal.util';
import { BillingSequenceService } from '@/services/billing-sequence.service';
import type { BillingRequestContext } from '@/common/context/billing-context';
import type {
  CreateCorporateClientDto,
  CreateCorporateContractDto,
  UpsertCreditLimitDto,
  GenerateStatementDto,
  UpdateCorporateClientDto,
} from './dto/corporate.dto';

@Injectable()
export class CorporateService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly sequenceService: BillingSequenceService,
  ) {}

  createClient(ctx: BillingRequestContext, dto: CreateCorporateClientDto) {
    return this.prisma.corporateClient.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        legalName: dto.legalName,
        gstin: dto.gstin,
        pan: dto.pan,
        contactPerson: dto.contactPerson,
        email: dto.email,
        phone: dto.phone,
        paymentTermsDays: dto.paymentTermsDays ?? 30,
      },
    });
  }

  updateClient(ctx: BillingRequestContext, clientId: string, dto: UpdateCorporateClientDto) {
    return this.prisma.corporateClient.update({
      where: { id: clientId, tenantId: ctx.tenantId },
      data: dto,
    });
  }

  listClients(ctx: BillingRequestContext) {
    return this.prisma.corporateClient.findMany({
      where: { tenantId: ctx.tenantId, organizationId: ctx.organizationId },
      include: { creditLimit: true, contracts: { where: { status: 'active' } } },
      orderBy: { name: 'asc' },
    });
  }

  createContract(ctx: BillingRequestContext, dto: CreateCorporateContractDto) {
    return this.prisma.corporateContract.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        corporateClientId: dto.corporateClientId,
        contractNumber: dto.contractNumber,
        rateCardId: dto.rateCardId,
        discountPercent: dto.discountPercent ?? 0,
        creditLimit: dto.creditLimit,
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
      },
    });
  }

  listContracts(ctx: BillingRequestContext, corporateClientId?: string) {
    return this.prisma.corporateContract.findMany({
      where: {
        tenantId: ctx.tenantId,
        ...(corporateClientId ? { corporateClientId } : {}),
      },
      include: { corporateClient: true },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  upsertCreditLimit(ctx: BillingRequestContext, dto: UpsertCreditLimitDto) {
    return this.prisma.creditLimit.upsert({
      where: { corporateClientId: dto.corporateClientId },
      create: {
        tenantId: ctx.tenantId,
        corporateClientId: dto.corporateClientId,
        creditLimit: dto.creditLimit,
        usedAmount: 0,
        availableAmount: dto.creditLimit,
        alertThreshold: dto.alertThreshold,
      },
      update: {
        creditLimit: dto.creditLimit,
        availableAmount: dto.creditLimit,
        alertThreshold: dto.alertThreshold,
      },
    });
  }

  async generateStatement(ctx: BillingRequestContext, dto: GenerateStatementDto) {
    const client = await this.prisma.corporateClient.findFirst({
      where: { id: dto.corporateClientId, tenantId: ctx.tenantId },
    });
    if (!client) throw new NotFoundException('Corporate client not found');

    const branch = await this.prisma.branch.findFirst({ where: { id: ctx.branchId } });
    const statementNumber = await this.sequenceService.nextNumber(
      ctx.tenantId,
      ctx.branchId,
      'STMT',
      branch?.code ?? 'HQ',
    );

    const periodStart = new Date(dto.periodYear, dto.periodMonth - 1, 1);
    const periodEnd = new Date(dto.periodYear, dto.periodMonth, 0, 23, 59, 59);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId: ctx.tenantId,
        corporateClientId: dto.corporateClientId,
        createdAt: { gte: periodStart, lte: periodEnd },
        status: { notIn: ['VOID', 'DRAFT'] },
      },
      include: { payments: { where: { status: 'SUCCESS' } } },
    });

    const totalInvoiced = round2(
      invoices.reduce((s, inv) => s + toNumber(inv.totalAmount), 0),
    );
    const totalPaid = round2(
      invoices.reduce(
        (s, inv) => s + inv.payments.reduce((ps, p) => ps + toNumber(p.amount), 0),
        0,
      ),
    );

    const prevStatement = await this.prisma.monthlyStatement.findFirst({
      where: {
        corporateClientId: dto.corporateClientId,
        OR: [
          { periodYear: { lt: dto.periodYear } },
          { periodYear: dto.periodYear, periodMonth: { lt: dto.periodMonth } },
        ],
      },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    });

    const openingBalance = prevStatement ? toNumber(prevStatement.closingBalance) : 0;
    const closingBalance = round2(openingBalance + totalInvoiced - totalPaid);

    return this.prisma.monthlyStatement.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        corporateClientId: dto.corporateClientId,
        statementNumber,
        periodMonth: dto.periodMonth,
        periodYear: dto.periodYear,
        openingBalance,
        totalInvoiced,
        totalPaid,
        closingBalance,
      },
    });
  }

  listStatements(ctx: BillingRequestContext, corporateClientId?: string) {
    return this.prisma.monthlyStatement.findMany({
      where: {
        tenantId: ctx.tenantId,
        ...(corporateClientId ? { corporateClientId } : {}),
      },
      include: { corporateClient: true },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    });
  }
}
