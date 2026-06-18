import { Injectable } from '@nestjs/common';
import { AiInferenceType } from '@health/db';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { InferenceEngine } from '@/services/inference.engine';
import { InferenceLogService } from '@/services/inference-log.service';
import type { ForecastDto, StaffPlanningDto } from './dto/operational.dto';

@Injectable()
export class OperationalService {
  constructor(
    private readonly engine: InferenceEngine,
    private readonly inferenceLog: InferenceLogService,
  ) {}

  inventoryForecast(ctx: ServiceRequestContext, dto: ForecastDto) {
    return this.inferenceLog.runWithLog(
      {
        tenantId: ctx.tenantId,
        inferenceType: AiInferenceType.INVENTORY_FORECAST,
        inputRef: dto.inputRef,
      },
      () => this.engine.movingAverageForecast(dto),
      (r) => r.confidence,
    );
  }

  demandForecast(ctx: ServiceRequestContext, dto: ForecastDto) {
    return this.inferenceLog.runWithLog(
      {
        tenantId: ctx.tenantId,
        inferenceType: AiInferenceType.DEMAND_FORECAST,
        inputRef: dto.inputRef,
      },
      () => this.engine.movingAverageForecast(dto),
      (r) => r.confidence,
    );
  }

  revenueForecast(ctx: ServiceRequestContext, dto: ForecastDto) {
    return this.inferenceLog.runWithLog(
      {
        tenantId: ctx.tenantId,
        inferenceType: AiInferenceType.REVENUE_FORECAST,
        inputRef: dto.inputRef,
      },
      () => this.engine.movingAverageForecast(dto),
      (r) => r.confidence,
    );
  }

  staffPlanning(ctx: ServiceRequestContext, dto: StaffPlanningDto) {
    return this.inferenceLog.runWithLog(
      {
        tenantId: ctx.tenantId,
        inferenceType: AiInferenceType.STAFF_PLANNING,
        inputRef: dto.inputRef,
      },
      () => this.engine.planStaff(dto),
      (r) => r.confidence,
    );
  }
}
