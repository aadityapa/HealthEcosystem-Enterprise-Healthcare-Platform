import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';

@Injectable()
export class TaxRulesService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async getByCountryCode(countryCode: string) {
    const pack = await this.prisma.countryPack.findUnique({
      where: { countryCode: countryCode.toUpperCase() },
    });
    if (!pack) throw new NotFoundException(`Tax rules not found for country: ${countryCode}`);
    return {
      countryCode: pack.countryCode,
      name: pack.name,
      currency: pack.currency,
      taxRules: pack.taxRules,
    };
  }
}
