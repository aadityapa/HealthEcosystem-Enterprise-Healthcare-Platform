import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';

@Injectable()
export class CountriesService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async list() {
    const items = await this.prisma.countryPack.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
    return { items };
  }
}
