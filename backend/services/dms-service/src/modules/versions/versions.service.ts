import { Inject, Injectable } from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { DocumentsService } from '@/modules/documents/documents.service';
import type { CreateVersionDto } from './dto/versions.dto';

@Injectable()
export class VersionsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly documentsService: DocumentsService,
  ) {}

  async createVersion(ctx: ServiceRequestContext, documentId: string, dto: CreateVersionDto) {
    const document = await this.documentsService.getById(ctx, documentId);
    const nextVersion = document.currentVersion + 1;

    const [version] = await this.prisma.$transaction([
      this.prisma.documentVersion.create({
        data: {
          documentId,
          version: nextVersion,
          storageKey: dto.storageKey,
          fileSize: dto.fileSize != null ? BigInt(dto.fileSize) : undefined,
          changeNotes: dto.changeNotes,
          uploadedBy: ctx.userId,
        },
      }),
      this.prisma.document.update({
        where: { id: documentId },
        data: {
          currentVersion: nextVersion,
          storageKey: dto.storageKey,
          fileSize: dto.fileSize != null ? BigInt(dto.fileSize) : document.fileSize,
        },
      }),
    ]);

    return version;
  }

  async listVersions(ctx: ServiceRequestContext, documentId: string) {
    await this.documentsService.getById(ctx, documentId);

    return this.prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { version: 'desc' },
    });
  }
}
