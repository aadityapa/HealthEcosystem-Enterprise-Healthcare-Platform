import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { ExchangeService } from './exchange.service';
import { PRISMA } from '@/database/database.module';

describe('ExchangeService', () => {
  let service: ExchangeService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      healthRecordLink: {
        findFirst: jest.fn(),
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      abdmTransaction: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [ExchangeService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get<ExchangeService>(ExchangeService);
  });

  it('links health record to care context', async () => {
    prisma.healthRecordLink.findFirst.mockResolvedValue(null);
    prisma.healthRecordLink.create.mockResolvedValue({
      id: 'link-1',
      careContextId: 'ctx-1',
    });
    prisma.abdmTransaction.create.mockResolvedValue({ id: 'txn-1' });

    const result = await service.linkHealthRecord(ctx, {
      patientId: 'pat-1',
      abhaNumber: '12-3456-7890-1234',
      hipId: 'HIP-001',
      careContextId: 'ctx-1',
      referenceType: 'DiagnosticReport',
      referenceId: 'ref-1',
    });

    expect(result.careContextId).toBe('ctx-1');
    expect(prisma.abdmTransaction.create).toHaveBeenCalled();
  });

  it('throws ConflictException when care context already linked', async () => {
    prisma.healthRecordLink.findFirst.mockResolvedValue({ id: 'link-1' });

    await expect(
      service.linkHealthRecord(ctx, {
        patientId: 'pat-1',
        abhaNumber: '12-3456-7890-1234',
        hipId: 'HIP-001',
        careContextId: 'ctx-1',
        referenceType: 'DiagnosticReport',
        referenceId: 'ref-1',
      }),
    ).rejects.toThrow(ConflictException);
  });

  it('handles HIU callback stub', async () => {
    prisma.abdmTransaction.findFirst.mockResolvedValue(null);
    prisma.abdmTransaction.create.mockResolvedValue({
      id: 'txn-1',
      status: 'completed',
    });

    const result = await service.hiuCallback({
      transactionId: 'txn-abc',
      requestType: 'data_push',
      payload: { status: 'ok' },
    });

    expect(result.status).toBe('completed');
  });

  it('throws NotFoundException when health record link is missing', async () => {
    prisma.healthRecordLink.findFirst.mockResolvedValue(null);

    await expect(service.getHealthRecordLink(ctx, 'missing')).rejects.toThrow(
      NotFoundException,
    );
  });
});
