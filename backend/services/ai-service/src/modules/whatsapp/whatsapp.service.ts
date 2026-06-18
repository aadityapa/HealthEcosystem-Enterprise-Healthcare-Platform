import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { AiInferenceType, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { InferenceEngine } from '@/services/inference.engine';
import { InferenceLogService } from '@/services/inference-log.service';
import type { WhatsAppWebhookDto } from './dto/whatsapp.dto';

@Injectable()
export class WhatsAppService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly engine: InferenceEngine,
    private readonly inferenceLog: InferenceLogService,
  ) {}

  async handleWebhook(dto: WhatsAppWebhookDto) {
    const tenantId = dto.tenantId;
    if (!tenantId) {
      throw new BadRequestException('tenantId is required in webhook payload');
    }

    const session = await this.prisma.whatsAppSession.upsert({
      where: {
        tenantId_phone: { tenantId, phone: dto.phone },
      },
      create: {
        tenantId,
        phone: dto.phone,
        waId: dto.waId,
        lastMessageAt: new Date(),
      },
      update: {
        waId: dto.waId ?? undefined,
        lastMessageAt: new Date(),
      },
    });

    const reply = this.engine.generateChatResponse(dto.message);

    const inference = await this.inferenceLog.log({
      tenantId,
      inferenceType: AiInferenceType.CHAT,
      inputRef: session.id,
      output: {
        channel: 'whatsapp',
        inbound: dto.message,
        outbound: reply,
      },
      confidence: 0.78,
      modelKey: 'rule-based-whatsapp-v1',
    });

    return {
      sessionId: session.id,
      reply,
      logId: inference.id,
    };
  }

  listSessions(ctx: ServiceRequestContext) {
    return this.prisma.whatsAppSession.findMany({
      where: { tenantId: ctx.tenantId },
      orderBy: { lastMessageAt: 'desc' },
    });
  }
}
