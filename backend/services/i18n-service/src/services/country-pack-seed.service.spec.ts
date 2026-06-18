import { CountryPackSeedService } from './country-pack-seed.service';
import { COUNTRY_PACK_SEEDS } from './country-pack-data';

describe('CountryPackSeedService', () => {
  const prisma = {
    countryPack: { upsert: jest.fn() },
  };

  let service: CountryPackSeedService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new CountryPackSeedService(prisma as never);
    prisma.countryPack.upsert.mockImplementation(({ create }) =>
      Promise.resolve({ countryCode: create.countryCode }),
    );
  });

  it('seeds all five country packs', async () => {
    const result = await service.seedCountryPacks();
    expect(prisma.countryPack.upsert).toHaveBeenCalledTimes(COUNTRY_PACK_SEEDS.length);
    expect(result).toHaveLength(5);
  });

  it('seeds India pack with GST rules', async () => {
    await service.seedCountryPacks();
    expect(prisma.countryPack.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { countryCode: 'IN' },
        create: expect.objectContaining({ currency: 'INR' }),
      }),
    );
  });
});
