import { NotFoundException } from '@nestjs/common';
import { PricingService } from './pricing.service';

describe('PricingService', () => {
  const ctx = {
    tenantId: 't1',
    organizationId: 'o1',
    branchId: 'b1',
    userId: 'u1',
  };

  const prisma = {
    testMaster: { findFirst: jest.fn() },
    testPricing: { findFirst: jest.fn() },
    packageMaster: { findFirst: jest.fn() },
    profileMaster: { findFirst: jest.fn() },
    billingCode: { findFirst: jest.fn() },
    corporateContract: { findFirst: jest.fn() },
    rateCard: { findFirst: jest.fn() },
  };

  let service: PricingService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new PricingService(prisma as never);
  });

  it('resolves test pricing from TestPricing', async () => {
    prisma.testMaster.findFirst.mockResolvedValue({ id: 'test1', name: 'CBC' });
    prisma.testPricing.findFirst.mockResolvedValue({ basePrice: 500, corporatePrice: 450 });
    prisma.corporateContract.findFirst.mockResolvedValue(null);

    const result = await service.resolveLine(ctx, {
      lineType: 'TEST',
      referenceId: 'test1',
    });

    expect(result.description).toBe('CBC');
    expect(result.unitPrice).toBe(500);
  });

  it('uses corporate price when corporate client specified', async () => {
    prisma.testMaster.findFirst.mockResolvedValue({ id: 'test1', name: 'CBC' });
    prisma.testPricing.findFirst.mockResolvedValue({ basePrice: 500, corporatePrice: 450 });
    prisma.corporateContract.findFirst.mockResolvedValue({ discountPercent: 0, rateCardId: null });

    const result = await service.resolveLine(
      ctx,
      { lineType: 'TEST', referenceId: 'test1' },
      { corporateClientId: 'corp1' },
    );

    expect(result.unitPrice).toBe(450);
  });

  it('applies contract discount percent', async () => {
    prisma.testMaster.findFirst.mockResolvedValue({ id: 'test1', name: 'CBC' });
    prisma.testPricing.findFirst.mockResolvedValue({ basePrice: 1000, corporatePrice: null });
    prisma.corporateContract.findFirst.mockResolvedValue({ discountPercent: 10, rateCardId: null });

    const result = await service.resolveLine(
      ctx,
      { lineType: 'TEST', referenceId: 'test1', quantity: 1 },
      { corporateClientId: 'corp1' },
    );

    expect(result.discount).toBe(100);
  });

  it('resolves package pricing', async () => {
    prisma.packageMaster.findFirst.mockResolvedValue({
      id: 'pkg1',
      name: 'Health Checkup',
      packagePrice: 2500,
    });

    const result = await service.resolveLine(ctx, {
      lineType: 'PACKAGE',
      referenceId: 'pkg1',
    });

    expect(result.unitPrice).toBe(2500);
    expect(result.description).toBe('Health Checkup');
  });

  it('resolves profile pricing', async () => {
    prisma.profileMaster.findFirst.mockResolvedValue({
      id: 'prof1',
      name: 'Diabetes Profile',
      profilePrice: 1800,
    });

    const result = await service.resolveLine(ctx, {
      lineType: 'PROFILE',
      referenceId: 'prof1',
    });

    expect(result.unitPrice).toBe(1800);
  });

  it('resolves billing code with tax master', async () => {
    prisma.billingCode.findFirst.mockResolvedValue({
      name: 'Home Collection',
      defaultPrice: 200,
      taxMaster: {
        cgstRate: 9,
        sgstRate: 9,
        igstRate: 18,
        isExempt: false,
        hsnSacCode: '999799',
      },
    });

    const result = await service.resolveLine(ctx, {
      lineType: 'SERVICE',
      itemCode: 'HC001',
    });

    expect(result.unitPrice).toBe(200);
    expect(result.taxRates.cgstRate).toBe(9);
    expect(result.hsnSacCode).toBe('999799');
  });

  it('throws when test not found', async () => {
    prisma.testMaster.findFirst.mockResolvedValue(null);
    await expect(
      service.resolveLine(ctx, { lineType: 'TEST', referenceId: 'missing' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('applies rate card override from contract', async () => {
    prisma.testMaster.findFirst.mockResolvedValue({ id: 'test1', name: 'CBC' });
    prisma.testPricing.findFirst.mockResolvedValue({ basePrice: 500 });
    prisma.corporateContract.findFirst.mockResolvedValue({
      discountPercent: 0,
      rateCardId: 'rc1',
    });
    prisma.rateCard.findFirst.mockResolvedValue({
      pricingRules: [{ itemType: 'TEST', price: 400 }],
    });

    const result = await service.resolveLine(
      ctx,
      { lineType: 'TEST', referenceId: 'test1' },
      { corporateClientId: 'corp1' },
    );

    expect(result.unitPrice).toBe(400);
  });
});
