import { Test, TestingModule } from '@nestjs/testing';
import { AiInferenceType } from '@health/db';
import { InferenceLogService } from './inference-log.service';
import { PRISMA } from '@/database/database.module';

describe('InferenceLogService', () => {
  let service: InferenceLogService;
  let prisma: { aiInferenceLog: { create: jest.Mock } };

  beforeEach(async () => {
    prisma = {
      aiInferenceLog: {
        create: jest.fn().mockResolvedValue({ id: 'log-1' }),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InferenceLogService,
        { provide: PRISMA, useValue: prisma },
      ],
    }).compile();

    service = module.get(InferenceLogService);
  });

  it('logs inference to AiInferenceLog', async () => {
    await service.log({
      tenantId: 'tenant-1',
      inferenceType: AiInferenceType.ABNORMAL_DETECTION,
      output: { isAbnormal: true },
      confidence: 0.9,
    });

    expect(prisma.aiInferenceLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          inferenceType: AiInferenceType.ABNORMAL_DETECTION,
          modelKey: 'rule-based-v1',
        }),
      }),
    );
  });

  it('runWithLog attaches logId to result', async () => {
    const result = await service.runWithLog(
      {
        tenantId: 'tenant-1',
        inferenceType: AiInferenceType.DEMAND_FORECAST,
      },
      () => ({ forecast: [], confidence: 0.7 }),
      (r) => r.confidence,
    );

    expect(result.logId).toBe('log-1');
    expect(result.forecast).toEqual([]);
  });
});
