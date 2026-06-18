import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ChatService } from './chat.service';
import { InferenceEngine } from '@/services/inference.engine';
import { InferenceLogService } from '@/services/inference-log.service';
import { PRISMA } from '@/database/database.module';

describe('ChatService', () => {
  let service: ChatService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      chatSession: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      chatMessage: {
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        InferenceEngine,
        {
          provide: InferenceLogService,
          useValue: { log: jest.fn().mockResolvedValue({ id: 'log-1' }) },
        },
        { provide: PRISMA, useValue: prisma },
      ],
    }).compile();

    service = module.get(ChatService);
  });

  it('creates chat session', async () => {
    prisma.chatSession.create.mockResolvedValue({ id: 'session-1', channel: 'web' });

    const result = await service.createSession(ctx, { channel: 'web' });
    expect(result.id).toBe('session-1');
  });

  it('throws when session not found', async () => {
    prisma.chatSession.findFirst.mockResolvedValue(null);

    await expect(
      service.sendMessage(ctx, 'missing-session', { content: 'Hi' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('persists user and assistant messages', async () => {
    prisma.chatSession.findFirst.mockResolvedValue({
      id: 'session-1',
      messages: [],
    });
    prisma.chatMessage.create
      .mockResolvedValueOnce({ id: 'msg-1', role: 'user' })
      .mockResolvedValueOnce({ id: 'msg-2', role: 'assistant' });
    prisma.chatSession.update.mockResolvedValue({});

    const result = await service.sendMessage(ctx, 'session-1', {
      content: 'Hello',
    });

    expect(prisma.chatMessage.create).toHaveBeenCalledTimes(2);
    expect(result.assistantMessage.role).toBe('assistant');
    expect(result.logId).toBe('log-1');
  });
});
