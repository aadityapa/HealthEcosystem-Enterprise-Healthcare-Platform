import { Injectable } from '@nestjs/common';
import { AiInferenceType } from '@health/db';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { InferenceEngine } from '@/services/inference.engine';
import { InferenceLogService } from '@/services/inference-log.service';
import type { TranscribeDto, VoiceRespondDto } from './dto/voice.dto';

@Injectable()
export class VoiceService {
  constructor(
    private readonly engine: InferenceEngine,
    private readonly inferenceLog: InferenceLogService,
  ) {}

  async transcribe(ctx: ServiceRequestContext, dto: TranscribeDto) {
    return this.inferenceLog.runWithLog(
      {
        tenantId: ctx.tenantId,
        inferenceType: AiInferenceType.VOICE,
        inputRef: dto.language,
        modelKey: 'stub-transcribe-v1',
      },
      () => ({
        transcript: '[stub] Audio transcription not yet implemented',
        language: dto.language ?? 'en-IN',
        confidence: 0,
        stub: true,
      }),
      () => 0,
    );
  }

  respond(ctx: ServiceRequestContext, dto: VoiceRespondDto) {
    return this.inferenceLog.runWithLog(
      {
        tenantId: ctx.tenantId,
        inferenceType: AiInferenceType.VOICE,
        inputRef: dto.inputRef,
        modelKey: 'rule-based-voice-v1',
      },
      () => ({
        transcript: dto.transcript,
        response: this.engine.generateVoiceResponse(dto.transcript),
        confidence: 0.75,
      }),
      () => 0.75,
    );
  }
}
