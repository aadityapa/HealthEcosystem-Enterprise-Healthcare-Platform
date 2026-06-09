import { COUNTRY_PACK_SEEDS } from './country-pack-data';

describe('COUNTRY_PACK_SEEDS', () => {
  it('includes IN, AE, SA, SG, GB packs', () => {
    const codes = COUNTRY_PACK_SEEDS.map((p) => p.countryCode);
    expect(codes).toEqual(expect.arrayContaining(['IN', 'AE', 'SA', 'SG', 'GB']));
    expect(codes).toHaveLength(5);
  });

  it('defines tax rules for each pack', () => {
    for (const pack of COUNTRY_PACK_SEEDS) {
      expect(Object.keys(pack.taxRules).length).toBeGreaterThan(0);
    }
  });
});
