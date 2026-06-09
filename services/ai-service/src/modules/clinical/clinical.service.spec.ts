import { Test, TestingModule } from '@nestjs/testing';
import { AiInferenceType } from '@health/db';
import { ClinicalService } from './clinical.service';
import { InferenceEngine } from '@/services/inference.engine';
import { InferenceLogService } from '@/services/inference-log.service';

describe('ClinicalService', () => {
  let service: ClinicalService;
  let inferenceLog: { runWithLog: jest.Mock };

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    inferenceLog = {
      runWithLog: jest.fn(async (_params, fn, extract) => {
        const result = await fn();
        return { ...result, logId: 'log-1', confidence: extract?.(result) };
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ClinicalService,
        InferenceEngine,
        { provide: InferenceLogService, useValue: inferenceLog },
      ],
    }).compile();

    service = module.get(ClinicalService);
  });

  it('abnormalDetect logs ABNORMAL_DETECTION inference', async () => {
    const result = await service.abnormalDetect(ctx, {
      testCode: 'GLUCOSE',
      value: 200,
      referenceHigh: 110,
      mean: 100,
      stdDev: 10,
    });

    expect(inferenceLog.runWithLog).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId: ctx.tenantId,
        inferenceType: AiInferenceType.ABNORMAL_DETECTION,
      }),
      expect.any(Function),
      expect.any(Function),
    );
    expect(result.isAbnormal).toBe(true);
    expect(result.logId).toBe('log-1');
  });

  it('criticalValue evaluates panic thresholds', async () => {
    const result = await service.criticalValue(ctx, {
      testCode: 'GLUCOSE',
      value: 550,
    });

    expect(result.severity).toBe('panic');
  });
});
