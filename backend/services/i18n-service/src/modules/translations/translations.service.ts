import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type {
  CreateTranslationDto,
  CreateTranslationKeyDto,
  UpdateTranslationDto,
} from './dto/translations.dto';

@Injectable()
export class TranslationsService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async createKey(dto: CreateTranslationKeyDto) {
    return this.prisma.translationKey.upsert({
      where: { namespace_key: { namespace: dto.namespace, key: dto.key } },
      create: {
        namespace: dto.namespace,
        key: dto.key,
        defaultValue: dto.defaultValue,
      },
      update: { defaultValue: dto.defaultValue },
    });
  }

  async upsertTranslation(dto: CreateTranslationDto) {
    const key = await this.prisma.translationKey.upsert({
      where: { namespace_key: { namespace: dto.namespace, key: dto.key } },
      create: {
        namespace: dto.namespace,
        key: dto.key,
        defaultValue: dto.value,
      },
      update: {},
    });

    return this.prisma.translation.upsert({
      where: { keyId_locale: { keyId: key.id, locale: dto.locale } },
      create: { keyId: key.id, locale: dto.locale, value: dto.value },
      update: { value: dto.value },
    });
  }

  async list(namespace?: string) {
    const items = await this.prisma.translationKey.findMany({
      where: namespace ? { namespace } : undefined,
      include: { translations: true },
      orderBy: [{ namespace: 'asc' }, { key: 'asc' }],
    });
    return { items };
  }

  async getBundle(locale: string, namespace: string) {
    const keys = await this.prisma.translationKey.findMany({
      where: { namespace },
      include: {
        translations: { where: { locale } },
      },
    });

    const bundle: Record<string, string> = {};
    for (const key of keys) {
      bundle[key.key] = key.translations[0]?.value ?? key.defaultValue;
    }
    return { locale, namespace, bundle };
  }

  async updateTranslation(id: string, dto: UpdateTranslationDto) {
    const translation = await this.prisma.translation.findUnique({ where: { id } });
    if (!translation) throw new NotFoundException('Translation not found');

    return this.prisma.translation.update({
      where: { id },
      data: { value: dto.value },
    });
  }

  async removeTranslation(id: string) {
    const translation = await this.prisma.translation.findUnique({ where: { id } });
    if (!translation) throw new NotFoundException('Translation not found');
    await this.prisma.translation.delete({ where: { id } });
    return { deleted: true };
  }
}
