import { CountriesService } from './countries.service';

describe('CountriesService', () => {
  const prisma = {
    countryPack: { findMany: jest.fn() },
  };

  let service: CountriesService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CountriesService(prisma as never);
  });

  it('lists active country packs', async () => {
    prisma.countryPack.findMany.mockResolvedValue([
      { countryCode: 'IN', name: 'India' },
      { countryCode: 'GB', name: 'United Kingdom' },
    ]);
    const result = await service.list();
    expect(result.items).toHaveLength(2);
  });
});
