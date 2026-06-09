import { BadRequestException } from '@nestjs/common';
import { CreditLimitService } from './credit-limit.service';

describe('CreditLimitService', () => {
  const ctx = {
    tenantId: 't1',
    organizationId: 'o1',
    branchId: 'b1',
    userId: 'u1',
  };

  const prisma = {
    creditLimit: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  let service: CreditLimitService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CreditLimitService(prisma as never);
  });

  it('passes when no credit limit configured', async () => {
    prisma.creditLimit.findUnique.mockResolvedValue(null);
    await expect(
      service.assertAvailableCredit(ctx, 'corp-1', 5000),
    ).resolves.toBeUndefined();
  });

  it('passes when sufficient credit available', async () => {
    prisma.creditLimit.findUnique.mockResolvedValue({
      creditLimit: 100000,
      usedAmount: 20000,
      availableAmount: 80000,
    });
    await expect(
      service.assertAvailableCredit(ctx, 'corp-1', 50000),
    ).resolves.toBeUndefined();
  });

  it('throws when credit limit exceeded', async () => {
    prisma.creditLimit.findUnique.mockResolvedValue({
      creditLimit: 100000,
      usedAmount: 95000,
      availableAmount: 5000,
    });
    await expect(
      service.assertAvailableCredit(ctx, 'corp-1', 10000),
    ).rejects.toThrow(BadRequestException);
  });

  it('reserves credit by incrementing used amount', async () => {
    await service.reserveCredit('corp-1', 5000);
    expect(prisma.creditLimit.update).toHaveBeenCalledWith({
      where: { corporateClientId: 'corp-1' },
      data: {
        usedAmount: { increment: 5000 },
        availableAmount: { decrement: 5000 },
      },
    });
  });

  it('releases credit on void', async () => {
    await service.releaseCredit('corp-1', 3000);
    expect(prisma.creditLimit.update).toHaveBeenCalledWith({
      where: { corporateClientId: 'corp-1' },
      data: {
        usedAmount: { decrement: 3000 },
        availableAmount: { increment: 3000 },
      },
    });
  });
});
