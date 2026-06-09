import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import { UpdateControlDto } from './dto/controls.dto';

@Injectable()
export class ControlsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async getById(id: string) {
    const control = await this.prisma.complianceControl.findUnique({
      where: { id },
      include: {
        pack: { select: { framework: true, name: true } },
        evidence: true,
      },
    });
    if (!control) throw new NotFoundException('Control not found');
    return control;
  }

  async assess(id: string, dto: UpdateControlDto) {
    await this.getById(id);

    return this.prisma.complianceControl.update({
      where: { id },
      data: {
        status: dto.status,
        lastAssessedAt: new Date(),
      },
      include: {
        pack: { select: { framework: true, name: true } },
      },
    });
  }
}
