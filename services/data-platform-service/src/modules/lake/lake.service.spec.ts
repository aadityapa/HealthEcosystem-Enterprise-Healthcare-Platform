import { Test, TestingModule } from '@nestjs/testing';
import { LakeService } from './lake.service';
import { KafkaIngestService } from '@/services/kafka-ingest.service';
import { S3LakeService } from '@/services/s3-lake.service';
import { PRISMA } from '@/database/database.module';

describe('LakeService', () => {
  let service: LakeService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      dataLakeObject: { findMany: jest.fn(), count: jest.fn(), create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LakeService,
        { provide: PRISMA, useValue: prisma },
        {
          provide: KafkaIngestService,
          useValue: {
            consumeTopic: jest.fn().mockResolvedValue({
              topic: 'lims.events',
              messagesConsumed: 50,
              status: 'stub',
            }),
          },
        },
        {
          provide: S3LakeService,
          useValue: {
            writeObject: jest.fn().mockResolvedValue({
              bucket: 'lake-bucket',
              objectKey: 'lake/tenant-1/lims.sample.created/2025-06-01.parquet',
              sizeBytes: 12800,
              status: 'stub',
            }),
          },
        },
      ],
    }).compile();

    service = module.get(LakeService);
  });

  it('lists lake objects', async () => {
    prisma.dataLakeObject.findMany.mockResolvedValue([{ id: 'obj-1' }]);
    prisma.dataLakeObject.count.mockResolvedValue(1);

    const result = await service.listObjects(ctx, {});

    expect(result.items).toHaveLength(1);
  });

  it('ingests kafka events to lake object', async () => {
    prisma.dataLakeObject.create.mockResolvedValue({ id: 'obj-1', format: 'parquet' });

    const result = await service.ingest(ctx, {
      sourceTopic: 'lims.events',
      sourceEvent: 'lims.sample.created',
    });

    expect(result.object.format).toBe('parquet');
    expect(result.ingest.messagesConsumed).toBe(50);
  });
});
