import { NotFoundException } from '@nestjs/common';
import { TaxRulesService } from './tax-rules.service';

describe('TaxRulesService', () => {
  const prisma = {
    countryPack: { findUnique: jest.fn() },
  };

  let service: TaxRulesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TaxRulesService(prisma as never);
  });

  it('returns tax rules for country', async () => {
    prisma.countryPack.findUnique.mockResolvedValue({
      countryCode: 'IN',
      name: 'India',
      currency: 'INR',
      taxRules: { gst: { standardRate: 18 } },
    });
    const result = await service.getByCountryCode('in');
    expect(result.taxRules).toEqual({ gst: { standardRate: 18 } });
  });

  it('throws when country pack missing', async () => {
    prisma.countryPack.findUnique.mockResolvedValue(null);
    await expect(service.getByCountryCode('XX')).rejects.toThrow(NotFoundException);
  });
});
