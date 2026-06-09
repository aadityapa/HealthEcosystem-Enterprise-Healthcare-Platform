import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import { COMPLIANCE_PACK_SEEDS } from './compliance-pack-data';

@Injectable()
export class CompliancePackSeedService implements OnModuleInit {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async onModuleInit(): Promise<void> {
    await this.seedCompliancePacks();
  }

  async seedCompliancePacks() {
    const seeded = [];

    for (const pack of COMPLIANCE_PACK_SEEDS) {
      const record = await this.prisma.compliancePack.upsert({
        where: { framework: pack.framework },
        create: {
          framework: pack.framework,
          name: pack.name,
          description: pack.description,
          controlCount: pack.controls.length,
          controls: {
            create: pack.controls.map((control) => ({
              controlCode: control.controlCode,
              title: control.title,
              description: control.description,
              category: control.category,
            })),
          },
        },
        update: {
          name: pack.name,
          description: pack.description,
          controlCount: pack.controls.length,
        },
      });

      for (const control of pack.controls) {
        await this.prisma.complianceControl.upsert({
          where: {
            packId_controlCode: {
              packId: record.id,
              controlCode: control.controlCode,
            },
          },
          create: {
            packId: record.id,
            controlCode: control.controlCode,
            title: control.title,
            description: control.description,
            category: control.category,
          },
          update: {
            title: control.title,
            description: control.description,
            category: control.category,
          },
        });
      }

      seeded.push(record);
    }

    return seeded;
  }
}
