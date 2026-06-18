import { Inject, Injectable } from '@nestjs/common';
import { AiInferenceType, Prisma, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';

export interface LogInferenceParams {
  tenantId: string;
  inferenceType: AiInferenceType;
  output: Prisma.InputJsonValue;
  inputRef?: string;
  confidence?: number;
  latencyMs?: number;
  modelKey?: string;
}

@Injectable()
export class InferenceLogService {
  constructor(@Inject(PRISMA) private readonly prisma: PrismaClient) {}

  async log(params: LogInferenceParams) {
    return this.prisma.aiInferenceLog.create({
      data: {
        tenantId: params.tenantId,
        inferenceType: params.inferenceType,
        inputRef: params.inputRef,
        output: params.output,
        confidence: params.confidence,
        latencyMs: params.latencyMs,
        modelKey: params.modelKey ?? 'rule-based-v1',
      },
    });
  }

  async runWithLog<T extends object>(
    params: Omit<LogInferenceParams, 'output' | 'latencyMs' | 'confidence'> & {
      inputRef?: string;
    },
    fn: () => T | Promise<T>,
    extractConfidence?: (result: T) => number | undefined,
  ): Promise<T & { logId: string }> {
    const start = Date.now();
    const result = await fn();
    const latencyMs = Date.now() - start;

    const log = await this.log({
      ...params,
      output: result as Prisma.InputJsonValue,
      latencyMs,
      confidence: extractConfidence?.(result),
    });

    return { ...result, logId: log.id };
  }
}
