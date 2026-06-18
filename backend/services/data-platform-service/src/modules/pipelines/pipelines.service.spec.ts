import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PipelineStatus } from '@health/db';
import { PipelinesService } from './pipelines.service';
import { KafkaIngestService } from '@/services/kafka-ingest.service';
import { S3LakeService } from '@/services/s3-lake.service';
import { PRISMA } from '@/database/database.module';

describe('PipelinesService', () => {
  let service: PipelinesService;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let kafkaIngest: { consumeTopic: jest.Mock };
  let s3Lake: { writeObject: jest.Mock };

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      dataPipeline: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      pipelineRun: {
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
    };
    kafkaIngest = {
      consumeTopic: jest.fn().mockResolvedValue({
        topic: 'lims.events',
        messagesConsumed: 100,
        status: 'stub',
      }),
    };
    s3Lake = {
      writeObject: jest.fn().mockResolvedValue({
        bucket: 'lake-bucket',
        objectKey: 'lake/path/RUN-000001.parquet',
        sizeBytes: 12800,
        status: 'stub',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PipelinesService,
        { provide: PRISMA, useValue: prisma },
        { provide: KafkaIngestService, useValue: kafkaIngest },
        { provide: S3LakeService, useValue: s3Lake },
      ],
    }).compile();

    service = module.get(PipelinesService);
  });

  it('creates pipeline', async () => {
    prisma.dataPipeline.create.mockResolvedValue({ id: 'pipe-1', pipelineName: 'LIMS ETL' });

    const result = await service.create(ctx, {
      pipelineName: 'LIMS ETL',
      sourceTopic: 'lims.events',
      lakePath: 'lake/lims',
    });

    expect(result.pipelineName).toBe('LIMS ETL');
  });

  it('throws when pipeline not found', async () => {
    prisma.dataPipeline.findFirst.mockResolvedValue(null);

    await expect(service.getById(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });

  it('runs pipeline through kafka and s3 stubs', async () => {
    prisma.dataPipeline.findFirst.mockResolvedValue({
      id: 'pipe-1',
      sourceTopic: 'lims.events',
      lakePath: 'lake/lims',
    });
    prisma.pipelineRun.count.mockResolvedValue(0);
    prisma.pipelineRun.create.mockResolvedValue({ id: 'run-1', status: PipelineStatus.RUNNING });
    prisma.pipelineRun.update.mockResolvedValue({ id: 'run-1', status: PipelineStatus.COMPLETED });
    prisma.dataPipeline.update.mockResolvedValue({ id: 'pipe-1', status: PipelineStatus.COMPLETED });

    const result = await service.run(ctx, 'pipe-1');

    expect(kafkaIngest.consumeTopic).toHaveBeenCalledWith('lims.events');
    expect(s3Lake.writeObject).toHaveBeenCalled();
    expect(result.run.status).toBe(PipelineStatus.COMPLETED);
  });

  it('lists pipelines with pagination', async () => {
    prisma.dataPipeline.findMany.mockResolvedValue([{ id: 'pipe-1' }]);
    prisma.dataPipeline.count.mockResolvedValue(1);

    const result = await service.list(ctx, {});

    expect(result.items).toHaveLength(1);
  });
});
