import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus, SettlementStatus, type PrismaClient } from '@health/db';
import { createEvent, type EventPublisher } from '@health/events';
import { EVENT_TYPES } from '@health/shared-types';
import { PRISMA } from '@/database/database.module';
import { EVENT_PUBLISHER } from '@/kafka/kafka.constants';
import { round2, toNumber } from '@/common/utils/decimal.util';
import { BillingSequenceService } from '@/services/billing-sequence.service';
import type { BillingRequestContext } from '@/common/context/billing-context';
import type { CreateRevenueShareRuleDto, CalculateSettlementDto } from './dto/franchise.dto';

@Injectable()
export class FranchiseSettlementService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: EventPublisher,
    private readonly sequenceService: BillingSequenceService,
  ) {}

  createRevenueShareRule(ctx: BillingRequestContext, dto: CreateRevenueShareRuleDto) {
    return this.prisma.revenueShareRule.create({
      data: {
        tenantId: ctx.tenantId,
        franchiseBranchId: dto.franchiseBranchId,
        revenueSharePct: dto.revenueSharePct,
        royaltyPct: dto.royaltyPct ?? 0,
        commissionPct: dto.commissionPct ?? 0,
        effectiveFrom: new Date(dto.effectiveFrom),
        effectiveTo: dto.effectiveTo ? new Date(dto.effectiveTo) : null,
      },
    });
  }

  listRevenueShareRules(ctx: BillingRequestContext, franchiseBranchId?: string) {
    return this.prisma.revenueShareRule.findMany({
      where: {
        tenantId: ctx.tenantId,
        isActive: true,
        ...(franchiseBranchId ? { franchiseBranchId } : {}),
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }

  async calculateSettlement(ctx: BillingRequestContext, dto: CalculateSettlementDto) {
    const rule = await this.prisma.revenueShareRule.findFirst({
      where: {
        tenantId: ctx.tenantId,
        franchiseBranchId: dto.franchiseBranchId,
        isActive: true,
        effectiveFrom: { lte: new Date(dto.periodEnd) },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: new Date(dto.periodStart) } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });

    if (!rule) throw new NotFoundException('No active revenue share rule found');

    const invoices = await this.prisma.invoice.findMany({
      where: {
        tenantId: ctx.tenantId,
        branchId: dto.franchiseBranchId,
        status: { in: [InvoiceStatus.ISSUED, InvoiceStatus.PAID, InvoiceStatus.PARTIALLY_PAID] },
        issuedAt: {
          gte: new Date(dto.periodStart),
          lte: new Date(dto.periodEnd),
        },
      },
    });

    const grossRevenue = round2(
      invoices.reduce((s, inv) => s + toNumber(inv.totalAmount), 0),
    );

    const revenueSharePct = toNumber(rule.revenueSharePct);
    const royaltyPct = toNumber(rule.royaltyPct);
    const commissionPct = toNumber(rule.commissionPct);

    const franchiseShare = round2((grossRevenue * revenueSharePct) / 100);
    const hqShare = round2(grossRevenue - franchiseShare);
    const royaltyAmount = round2((grossRevenue * royaltyPct) / 100);
    const commissionAmount = round2((grossRevenue * commissionPct) / 100);
    const netSettlement = round2(franchiseShare - royaltyAmount - commissionAmount);

    const branch = await this.prisma.branch.findFirst({
      where: { id: dto.franchiseBranchId },
    });

    const settlementNumber = await this.sequenceService.nextNumber(
      ctx.tenantId,
      dto.franchiseBranchId,
      'SET',
      branch?.code ?? 'FR',
    );

    const settlement = await this.prisma.franchiseSettlement.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        franchiseBranchId: dto.franchiseBranchId,
        parentBranchId: dto.parentBranchId,
        settlementNumber,
        periodStart: new Date(dto.periodStart),
        periodEnd: new Date(dto.periodEnd),
        grossRevenue,
        revenueSharePct,
        franchiseShare,
        hqShare,
        royaltyAmount,
        commissionAmount,
        netSettlement,
        status: SettlementStatus.CALCULATED,
      },
    });

    await this.eventPublisher.publish(
      createEvent(
        EVENT_TYPES.SETTLEMENT_CALCULATED,
        'FranchiseSettlement',
        settlement.id,
        ctx.tenantId,
        {
          settlementId: settlement.id,
          settlementNumber,
          franchiseBranchId: dto.franchiseBranchId,
          netSettlement,
        },
        { organizationId: ctx.organizationId, branchId: ctx.branchId, userId: ctx.userId },
      ),
    );

    return settlement;
  }

  listSettlements(
    ctx: BillingRequestContext,
    filters: { franchiseBranchId?: string; status?: string },
  ) {
    return this.prisma.franchiseSettlement.findMany({
      where: {
        tenantId: ctx.tenantId,
        ...(filters.franchiseBranchId ? { franchiseBranchId: filters.franchiseBranchId } : {}),
        ...(filters.status ? { status: filters.status as SettlementStatus } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
