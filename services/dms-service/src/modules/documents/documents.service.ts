import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DocumentStatus, type PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type {
  CreateDocumentDto,
  ListDocumentsQueryDto,
  UpdateDocumentDto,
  UploadDocumentDto,
} from './dto/documents.dto';

@Injectable()
export class DocumentsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(ctx: ServiceRequestContext, dto: CreateDocumentDto) {
    const documentNumber = await this.nextDocumentNumber(ctx.tenantId);

    return this.prisma.document.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        documentNumber,
        title: dto.title,
        category: dto.category,
        mimeType: dto.mimeType,
        metadata: (dto.metadata ?? {}) as object,
        createdBy: ctx.userId,
      },
    });
  }

  async list(
    ctx: ServiceRequestContext,
    filters: ListDocumentsQueryDto,
    page = 1,
    limit = 20,
  ) {
    const { skip, take } = paginate(page, limit);
    const where = {
      tenantId: ctx.tenantId,
      organizationId: ctx.organizationId,
      status: { not: DocumentStatus.DELETED },
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.category ? { category: filters.category } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { versions: { orderBy: { version: 'desc' }, take: 1 } },
      }),
      this.prisma.document.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(ctx: ServiceRequestContext, id: string) {
    const document = await this.prisma.document.findFirst({
      where: {
        id,
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        status: { not: DocumentStatus.DELETED },
      },
      include: {
        versions: { orderBy: { version: 'desc' } },
        signatures: { orderBy: { signedAt: 'desc' } },
      },
    });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return document;
  }

  async update(ctx: ServiceRequestContext, id: string, dto: UpdateDocumentDto) {
    await this.getById(ctx, id);

    return this.prisma.document.update({
      where: { id },
      data: {
        ...dto,
        metadata: dto.metadata ? (dto.metadata as object) : undefined,
      },
    });
  }

  async remove(ctx: ServiceRequestContext, id: string) {
    await this.getById(ctx, id);

    return this.prisma.document.update({
      where: { id },
      data: { status: DocumentStatus.DELETED },
    });
  }

  async upload(ctx: ServiceRequestContext, id: string, dto: UploadDocumentDto) {
    const document = await this.getById(ctx, id);
    const storageKey = dto.storageKey ?? `dms/${ctx.tenantId}/${document.documentNumber}/v${document.currentVersion}`;

    return this.prisma.document.update({
      where: { id },
      data: {
        storageKey,
        mimeType: dto.mimeType ?? document.mimeType,
        fileSize: dto.fileSize != null ? BigInt(dto.fileSize) : document.fileSize,
      },
    });
  }

  private async nextDocumentNumber(tenantId: string): Promise<string> {
    const count = await this.prisma.document.count({ where: { tenantId } });
    return `DOC-${String(count + 1).padStart(6, '0')}`;
  }
}
