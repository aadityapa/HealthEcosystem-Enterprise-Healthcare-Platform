import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SparkService } from './spark.service';

describe('SparkService', () => {
  let service: SparkService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SparkService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('spark://cluster:7077') },
        },
      ],
    }).compile();

    service = module.get(SparkService);
  });

  it('submits spark job stub', () => {
    const result = service.submitJob({
      jobName: 'warehouse-refresh',
      mainClass: 'com.health.etl.WarehouseRefresh',
    });

    expect(result.jobName).toBe('warehouse-refresh');
    expect(result.status).toBe('SUBMITTED');
    expect(result.clusterUrl).toBe('spark://cluster:7077');
    expect(result.stub).toBe(true);
  });
});
