import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import { toNumber } from '@/common/utils/decimal.util';
import type { BillingRequestContext } from '@/common/context/billing-context';

export interface PricingLineInput {
  lineType: string;
  itemCode?: string;
  referenceType?: string;
  referenceId?: string;
  quantity?: number;
}

export interface ResolvedPrice {
  description: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  hsnSacCode?: string;
  taxRates: {
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    isExempt: boolean;
  };
}

@Injectable()
export class PricingService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async resolveLine(
    ctx: BillingRequestContext,
    input: PricingLineInput,
    options?: { corporateClientId?: string; invoiceType?: string },
  ): Promise<ResolvedPrice> {
    const quantity = input.quantity ?? 1;
    let unitPrice = 0;
    let description = input.itemCode ?? input.lineType;
    let hsnSacCode: string | undefined;
    let discount = 0;
    const taxRates = { cgstRate: 9, sgstRate: 9, igstRate: 18, isExempt: false };

    if (input.lineType === 'TEST' && input.referenceId) {
      const test = await this.prisma.testMaster.findFirst({
        where: { id: input.referenceId, tenantId: ctx.tenantId },
      });
      if (!test) throw new NotFoundException(`Test ${input.referenceId} not found`);
      description = test.name;

      const pricing = await this.prisma.testPricing.findFirst({
        where: {
          testId: test.id,
          tenantId: ctx.tenantId,
          OR: [{ branchId: ctx.branchId }, { branchId: null }],
        },
        orderBy: { effectiveFrom: 'desc' },
      });

      if (options?.corporateClientId && pricing?.corporatePrice) {
        unitPrice = toNumber(pricing.corporatePrice);
      } else if (pricing) {
        unitPrice = toNumber(pricing.basePrice);
      }
    } else if (input.lineType === 'PACKAGE' && input.referenceId) {
      const pkg = await this.prisma.packageMaster.findFirst({
        where: { id: input.referenceId, tenantId: ctx.tenantId },
      });
      if (!pkg) throw new NotFoundException(`Package ${input.referenceId} not found`);
      description = pkg.name;
      unitPrice = toNumber(pkg.packagePrice);
    } else if (input.lineType === 'PROFILE' && input.referenceId) {
      const profile = await this.prisma.profileMaster.findFirst({
        where: { id: input.referenceId, tenantId: ctx.tenantId },
      });
      if (!profile) throw new NotFoundException(`Profile ${input.referenceId} not found`);
      description = profile.name;
      unitPrice = toNumber(profile.profilePrice);
    } else if (input.itemCode) {
      const billingCode = await this.prisma.billingCode.findFirst({
        where: { code: input.itemCode, tenantId: ctx.tenantId, isActive: true },
        include: { taxMaster: true },
      });
      if (billingCode) {
        description = billingCode.name;
        unitPrice = toNumber(billingCode.defaultPrice);
        if (billingCode.taxMaster) {
          taxRates.cgstRate = toNumber(billingCode.taxMaster.cgstRate);
          taxRates.sgstRate = toNumber(billingCode.taxMaster.sgstRate);
          taxRates.igstRate = toNumber(billingCode.taxMaster.igstRate);
          taxRates.isExempt = billingCode.taxMaster.isExempt;
          hsnSacCode = billingCode.taxMaster.hsnSacCode ?? undefined;
        }
      }
    }

    if (options?.corporateClientId) {
      const contract = await this.resolveCorporateContract(ctx, options.corporateClientId);
      if (contract) {
        const discountPct = toNumber(contract.discountPercent);
        if (discountPct > 0) {
          discount = (unitPrice * quantity * discountPct) / 100;
        }
        if (contract.rateCardId) {
          const rateCard = await this.prisma.rateCard.findFirst({
            where: { id: contract.rateCardId, tenantId: ctx.tenantId, isActive: true },
          });
          if (rateCard) {
            const rules = rateCard.pricingRules as Array<{
              itemType?: string;
              itemCode?: string;
              price?: number;
            }>;
            const rule = rules.find(
              (r) =>
                (r.itemCode && r.itemCode === input.itemCode) ||
                (r.itemType && r.itemType === input.lineType),
            );
            if (rule?.price != null) {
              unitPrice = rule.price;
            }
          }
        }
      }
    }

    return {
      description,
      unitPrice,
      quantity,
      discount: Math.round(discount * 100) / 100,
      hsnSacCode,
      taxRates,
    };
  }

  private async resolveCorporateContract(ctx: BillingRequestContext, corporateClientId: string) {
    const now = new Date();
    return this.prisma.corporateContract.findFirst({
      where: {
        tenantId: ctx.tenantId,
        corporateClientId,
        status: 'active',
        effectiveFrom: { lte: now },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: now } }],
      },
      orderBy: { effectiveFrom: 'desc' },
    });
  }
}
