import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AiInferenceType, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { InferenceEngine } from '@/services/inference.engine';
import { InferenceLogService } from '@/services/inference-log.service';
import type { CreateChatSessionDto, SendChatMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly engine: InferenceEngine,
    private readonly inferenceLog: InferenceLogService,
  ) {}

  async createSession(ctx: ServiceRequestContext, dto: CreateChatSessionDto) {
    return this.prisma.chatSession.create({
      data: {
        tenantId: ctx.tenantId,
        patientId: dto.patientId,
        channel: dto.channel ?? 'web',
        metadata: (dto.metadata ?? {}) as object,
      },
    });
  }

  async sendMessage(
    ctx: ServiceRequestContext,
    sessionId: string,
    dto: SendChatMessageDto,
  ) {
    const session = await this.prisma.chatSession.findFirst({
      where: { id: sessionId, tenantId: ctx.tenantId },
      include: {
        messages: { orderBy: { createdAt: 'asc' }, take: 10 },
      },
    });

    if (!session) {
      throw new NotFoundException('Chat session not found');
    }

    const history = session.messages.map((m) => m.content);

    const userMessage = await this.prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'user',
        content: dto.content,
      },
    });

    const assistantContent = this.engine.generateChatResponse(dto.content, history);

    const assistantMessage = await this.prisma.chatMessage.create({
      data: {
        sessionId,
        role: 'assistant',
        content: assistantContent,
      },
    });

    await this.prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    const inference = await this.inferenceLog.log({
      tenantId: ctx.tenantId,
      inferenceType: AiInferenceType.CHAT,
      inputRef: sessionId,
      output: {
        userMessage: dto.content,
        assistantMessage: assistantContent,
      },
      confidence: 0.8,
      modelKey: 'rule-based-chat-v1',
    });

    return {
      userMessage,
      assistantMessage,
      logId: inference.id,
    };
  }
}
