import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';

@Injectable()
export class PacksService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async list() {
    const packs = await this.prisma.compliancePack.findMany({
      where: { isActive: true },
      include: {
        controls: {
          select: {
            id: true,
            controlCode: true,
            title: true,
            status: true,
            category: true,
          },
        },
      },
      orderBy: { framework: 'asc' },
    });

    return { items: packs, total: packs.length };
  }
}
