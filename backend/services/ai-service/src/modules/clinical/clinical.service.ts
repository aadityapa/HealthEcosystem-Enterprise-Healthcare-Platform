import { Injectable } from '@nestjs/common';
import { AiInferenceType } from '@health/db';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { InferenceEngine } from '@/services/inference.engine';
import { InferenceLogService } from '@/services/inference-log.service';
import type {
  AbnormalDetectDto,
  CriticalValueDto,
  InterpretDto,
  RiskPredictDto,
} from './dto/clinical.dto';

@Injectable()
export class ClinicalService {
  constructor(
    private readonly engine: InferenceEngine,
    private readonly inferenceLog: InferenceLogService,
  ) {}

  abnormalDetect(ctx: ServiceRequestContext, dto: AbnormalDetectDto) {
    return this.inferenceLog.runWithLog(
      {
        tenantId: ctx.tenantId,
        inferenceType: AiInferenceType.ABNORMAL_DETECTION,
        inputRef: dto.inputRef ?? dto.testCode,
      },
      () => this.engine.detectAbnormal(dto),
      (r) => r.confidence,
    );
  }

  criticalValue(ctx: ServiceRequestContext, dto: CriticalValueDto) {
    return this.inferenceLog.runWithLog(
      {
        tenantId: ctx.tenantId,
        inferenceType: AiInferenceType.CRITICAL_VALUE,
        inputRef: dto.inputRef ?? dto.testCode,
      },
      () => this.engine.evaluateCriticalValue(dto),
      (r) => r.confidence,
    );
  }

  interpret(ctx: ServiceRequestContext, dto: InterpretDto) {
    return this.inferenceLog.runWithLog(
      {
        tenantId: ctx.tenantId,
        inferenceType: AiInferenceType.INTERPRETATION,
        inputRef: dto.inputRef ?? dto.testCode,
      },
      () => this.engine.interpretResult(dto),
      (r) => r.confidence,
    );
  }

  riskPredict(ctx: ServiceRequestContext, dto: RiskPredictDto) {
    return this.inferenceLog.runWithLog(
      {
        tenantId: ctx.tenantId,
        inferenceType: AiInferenceType.RISK_PREDICTION,
        inputRef: dto.inputRef,
      },
      () => this.engine.predictRisk(dto),
      (r) => r.confidence,
    );
  }
}
