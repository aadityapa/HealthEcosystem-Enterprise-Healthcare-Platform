import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ClaimStatus, type PrismaClient } from '@health/db';
import { createEvent, type EventPublisher } from '@health/events';
import { EVENT_TYPES } from '@health/shared-types';
import { PRISMA } from '@/database/database.module';
import { EVENT_PUBLISHER } from '@/kafka/kafka.constants';
import type { BillingRequestContext } from '@/common/context/billing-context';
import type {
  CreateInsuranceTPADto,
  CreateInsuranceClaimDto,
  UpdateClaimStatusDto,
  ReconcileClaimDto,
} from './dto/insurance.dto';

@Injectable()
export class InsuranceService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: EventPublisher,
  ) {}

  createTPA(ctx: BillingRequestContext, dto: CreateInsuranceTPADto) {
    return this.prisma.insuranceTPA.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        code: dto.code,
        name: dto.name,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
        apiEndpoint: dto.apiEndpoint,
      },
    });
  }

  listTPAs(ctx: BillingRequestContext) {
    return this.prisma.insuranceTPA.findMany({
      where: { tenantId: ctx.tenantId, isActive: true },
      orderBy: { name: 'asc' },
    });
  }

  async createClaim(ctx: BillingRequestContext, dto: CreateInsuranceClaimDto) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id: dto.invoiceId, tenantId: ctx.tenantId },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');

    return this.prisma.insuranceClaim.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        invoiceId: dto.invoiceId,
        tpaId: dto.tpaId,
        claimNumber: dto.claimNumber,
        policyNumber: dto.policyNumber,
        patientId: dto.patientId,
        claimedAmount: dto.claimedAmount,
        status: ClaimStatus.DRAFT,
        lines: {
          create: dto.lines.map((line) => ({
            description: line.description,
            amount: line.amount,
          })),
        },
      },
      include: { lines: true, tpa: true },
    });
  }

  async submitClaim(ctx: BillingRequestContext, claimId: string) {
    const claim = await this.findClaim(ctx, claimId);
    if (claim.status !== ClaimStatus.DRAFT) {
      throw new BadRequestException('Only draft claims can be submitted');
    }

    const updated = await this.prisma.insuranceClaim.update({
      where: { id: claimId },
      data: { status: ClaimStatus.SUBMITTED, submittedAt: new Date() },
      include: { lines: true, tpa: true },
    });

    await this.eventPublisher.publish(
      createEvent(
        EVENT_TYPES.CLAIM_SUBMITTED,
        'InsuranceClaim',
        claimId,
        ctx.tenantId,
        { claimId, claimNumber: claim.claimNumber, claimedAmount: claim.claimedAmount },
        { organizationId: ctx.organizationId, branchId: ctx.branchId, userId: ctx.userId },
      ),
    );

    return updated;
  }

  async updateClaimStatus(
    ctx: BillingRequestContext,
    claimId: string,
    dto: UpdateClaimStatusDto,
  ) {
    await this.findClaim(ctx, claimId);

    const data: Record<string, unknown> = { status: dto.status };
    if (dto.approvedAmount != null) {
      data.approvedAmount = dto.approvedAmount;
      data.approvedAt = new Date();
    }
    if (dto.settledAmount != null) {
      data.settledAmount = dto.settledAmount;
      data.settledAt = new Date();
    }
    if (dto.rejectionReason) data.rejectionReason = dto.rejectionReason;

    return this.prisma.insuranceClaim.update({
      where: { id: claimId },
      data,
      include: { lines: true, tpa: true },
    });
  }

  async reconcileClaim(
    ctx: BillingRequestContext,
    claimId: string,
    dto: ReconcileClaimDto,
  ) {
    const claim = await this.findClaim(ctx, claimId);
    const allowedStatuses: ClaimStatus[] = [
      ClaimStatus.APPROVED,
      ClaimStatus.PARTIALLY_APPROVED,
      ClaimStatus.SETTLED,
    ];
    if (!allowedStatuses.includes(claim.status)) {
      throw new BadRequestException('Claim must be approved before reconciliation');
    }

    const updated = await this.prisma.insuranceClaim.update({
      where: { id: claimId },
      data: {
        status: ClaimStatus.RECONCILED,
        settledAmount: dto.settledAmount,
        settledAt: new Date(),
      },
      include: { lines: true, tpa: true },
    });

    await this.eventPublisher.publish(
      createEvent(
        EVENT_TYPES.CLAIM_SETTLED,
        'InsuranceClaim',
        claimId,
        ctx.tenantId,
        { claimId, settledAmount: dto.settledAmount },
        { organizationId: ctx.organizationId, branchId: ctx.branchId, userId: ctx.userId },
      ),
    );

    return updated;
  }

  listClaims(
    ctx: BillingRequestContext,
    filters: { status?: string; tpaId?: string },
  ) {
    return this.prisma.insuranceClaim.findMany({
      where: {
        tenantId: ctx.tenantId,
        ...(filters.status ? { status: filters.status as ClaimStatus } : {}),
        ...(filters.tpaId ? { tpaId: filters.tpaId } : {}),
      },
      include: { lines: true, tpa: true, invoice: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  getClaim(ctx: BillingRequestContext, claimId: string) {
    return this.findClaim(ctx, claimId, true);
  }

  private async findClaim(ctx: BillingRequestContext, claimId: string, includeRelations = false) {
    const claim = await this.prisma.insuranceClaim.findFirst({
      where: { id: claimId, tenantId: ctx.tenantId },
      include: includeRelations ? { lines: true, tpa: true, invoice: true } : undefined,
    });
    if (!claim) throw new NotFoundException('Insurance claim not found');
    return claim;
  }
}
