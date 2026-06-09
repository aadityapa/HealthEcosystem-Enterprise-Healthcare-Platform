import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { S3LakeService } from './s3-lake.service';

describe('S3LakeService', () => {
  let service: S3LakeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3LakeService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('my-data-lake-bucket') },
        },
      ],
    }).compile();

    service = module.get(S3LakeService);
  });

  it('reads bucket from AWS_S3_BUCKET env', () => {
    expect(service.getBucket()).toBe('my-data-lake-bucket');
  });

  it('writes object stub to lake', async () => {
    const result = await service.writeObject('lake/tenant-1/events.parquet', 8192);

    expect(result.bucket).toBe('my-data-lake-bucket');
    expect(result.objectKey).toBe('lake/tenant-1/events.parquet');
    expect(result.sizeBytes).toBe(8192);
    expect(result.status).toBe('stub');
  });

  it('uses default bucket when env not set', async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        S3LakeService,
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue(undefined) } },
      ],
    }).compile();

    const defaultService = module.get(S3LakeService);
    expect(defaultService.getBucket()).toBe('healthecosystem-data-lake');
  });
});
