import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import { COUNTRY_PACK_SEEDS } from './country-pack-data';

@Injectable()
export class CountryPackSeedService implements OnModuleInit {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async onModuleInit(): Promise<void> {
    await this.seedCountryPacks();
  }

  async seedCountryPacks() {
    const seeded = [];
    for (const pack of COUNTRY_PACK_SEEDS) {
      const record = await this.prisma.countryPack.upsert({
        where: { countryCode: pack.countryCode },
        create: {
          countryCode: pack.countryCode,
          name: pack.name,
          currency: pack.currency,
          locale: pack.locale,
          taxRules: pack.taxRules as object,
          compliancePack: pack.compliancePack as object,
        },
        update: {
          name: pack.name,
          currency: pack.currency,
          locale: pack.locale,
          taxRules: pack.taxRules as object,
          compliancePack: pack.compliancePack as object,
        },
      });
      seeded.push(record);
    }
    return seeded;
  }
}
