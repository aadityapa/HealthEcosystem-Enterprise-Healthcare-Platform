import { Inject, Injectable } from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { DocumentsService } from '@/modules/documents/documents.service';

@Injectable()
export class OcrService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly documentsService: DocumentsService,
  ) {}

  async extractText(ctx: ServiceRequestContext, documentId: string) {
    const document = await this.documentsService.getById(ctx, documentId);

    const ocrText = this.stubExtract(document.title, document.storageKey);

    return this.prisma.document.update({
      where: { id: documentId },
      data: { ocrText },
    });
  }

  private stubExtract(title: string, storageKey: string | null): string {
    const keyPart = storageKey ? ` from ${storageKey}` : '';
    return `OCR extracted text for "${title}"${keyPart}. Sample content: patient report, lab results, diagnosis notes.`;
  }
}
