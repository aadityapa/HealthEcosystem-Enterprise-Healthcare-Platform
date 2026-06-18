import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { paginate, paginationMeta } from '@health/validation';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import type { CreateKnowledgeArticleDto, UpdateKnowledgeArticleDto } from './dto/knowledge.dto';

@Injectable()
export class KnowledgeService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async create(_ctx: ServiceRequestContext, dto: CreateKnowledgeArticleDto) {
    const existing = await this.prisma.knowledgeArticle.findUnique({
      where: { slug: dto.slug },
    });
    if (existing) throw new ConflictException('Article slug already exists');

    return this.prisma.knowledgeArticle.create({ data: dto });
  }

  async list(_ctx: ServiceRequestContext, page = 1, limit = 20, category?: string) {
    const { skip, take } = paginate(page, limit);
    const where = {
      isPublished: true,
      ...(category && { category }),
    };

    const [items, total] = await Promise.all([
      this.prisma.knowledgeArticle.findMany({
        where,
        skip,
        take,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.knowledgeArticle.count({ where }),
    ]);

    return { items, meta: paginationMeta(total, page, take) };
  }

  async getById(_ctx: ServiceRequestContext, id: string) {
    const article = await this.prisma.knowledgeArticle.findUnique({ where: { id } });
    if (!article) throw new NotFoundException('Knowledge article not found');

    await this.prisma.knowledgeArticle.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return article;
  }

  async update(_ctx: ServiceRequestContext, id: string, dto: UpdateKnowledgeArticleDto) {
    await this.getById(_ctx, id);
    return this.prisma.knowledgeArticle.update({ where: { id }, data: dto });
  }

  async remove(_ctx: ServiceRequestContext, id: string) {
    await this.getById(_ctx, id);
    await this.prisma.knowledgeArticle.delete({ where: { id } });
    return { deleted: true };
  }
}
