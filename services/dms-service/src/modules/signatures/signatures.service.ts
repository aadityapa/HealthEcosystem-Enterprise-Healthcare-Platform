import { Inject, Injectable } from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { DocumentsService } from '@/modules/documents/documents.service';
import type { SignDocumentDto } from './dto/signatures.dto';

@Injectable()
export class SignaturesService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly documentsService: DocumentsService,
  ) {}

  async sign(ctx: ServiceRequestContext, documentId: string, dto: SignDocumentDto) {
    await this.documentsService.getById(ctx, documentId);

    return this.prisma.documentSignature.create({
      data: {
        documentId,
        signedBy: ctx.userId,
        signedByName: dto.signedByName,
        signatureType: dto.signatureType,
        ipAddress: dto.ipAddress,
      },
    });
  }

  async listSignatures(ctx: ServiceRequestContext, documentId: string) {
    await this.documentsService.getById(ctx, documentId);

    return this.prisma.documentSignature.findMany({
      where: { documentId },
      orderBy: { signedAt: 'desc' },
    });
  }
}
