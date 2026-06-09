import { NotFoundException } from '@nestjs/common';
import { TranslationsService } from './translations.service';

describe('TranslationsService', () => {
  const prisma = {
    translationKey: { upsert: jest.fn(), findMany: jest.fn() },
    translation: { upsert: jest.fn(), findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
  };

  let service: TranslationsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new TranslationsService(prisma as never);
  });

  it('creates translation key', async () => {
    prisma.translationKey.upsert.mockResolvedValue({ id: 'key-1', key: 'welcome' });
    const result = await service.createKey({
      namespace: 'common',
      key: 'welcome',
      defaultValue: 'Welcome',
    });
    expect(result.key).toBe('welcome');
  });

  it('upserts translation for locale', async () => {
    prisma.translationKey.upsert.mockResolvedValue({ id: 'key-1' });
    prisma.translation.upsert.mockResolvedValue({ locale: 'en-IN', value: 'Namaste' });
    const result = await service.upsertTranslation({
      namespace: 'common',
      key: 'welcome',
      locale: 'en-IN',
      value: 'Namaste',
    });
    expect(result.value).toBe('Namaste');
  });

  it('builds translation bundle with fallback', async () => {
    prisma.translationKey.findMany.mockResolvedValue([
      {
        key: 'welcome',
        defaultValue: 'Welcome',
        translations: [{ value: 'Namaste' }],
      },
      {
        key: 'goodbye',
        defaultValue: 'Goodbye',
        translations: [],
      },
    ]);
    const result = await service.getBundle('en-IN', 'common');
    expect(result.bundle.welcome).toBe('Namaste');
    expect(result.bundle.goodbye).toBe('Goodbye');
  });

  it('throws when translation missing on update', async () => {
    prisma.translation.findUnique.mockResolvedValue(null);
    await expect(service.updateTranslation('missing', { value: 'x' })).rejects.toThrow(
      NotFoundException,
    );
  });
});
