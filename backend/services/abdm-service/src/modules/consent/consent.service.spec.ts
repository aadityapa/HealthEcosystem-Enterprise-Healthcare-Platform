import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConsentRequestStatus } from '@health/db';
import { ConsentService } from './consent.service';
import { PRISMA } from '@/database/database.module';
import { AbdmSequenceService } from '@/services/abdm-sequence.service';

describe('ConsentService', () => {
  let service: ConsentService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      consentArtifact: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsentService,
        { provide: PRISMA, useValue: prisma },
        { provide: AbdmSequenceService, useValue: { next: jest.fn().mockReturnValue('CONSENT-ABC') } },
      ],
    }).compile();

    service = module.get<ConsentService>(ConsentService);
  });

  it('requests consent', async () => {
    prisma.consentArtifact.create.mockResolvedValue({
      id: 'consent-1',
      status: ConsentRequestStatus.REQUESTED,
    });

    const result = await service.request(ctx, {
      patientId: 'pat-1',
      abhaNumber: '12-3456-7890-1234',
      purpose: 'Care management',
      hiTypes: ['DiagnosticReport'],
      dateFrom: '2026-01-01T00:00:00Z',
      dateTo: '2026-12-31T23:59:59Z',
    });

    expect(result.status).toBe(ConsentRequestStatus.REQUESTED);
  });

  it('grants requested consent', async () => {
    prisma.consentArtifact.findFirst.mockResolvedValue({
      id: 'consent-1',
      status: ConsentRequestStatus.REQUESTED,
    });
    prisma.consentArtifact.update.mockResolvedValue({
      id: 'consent-1',
      status: ConsentRequestStatus.GRANTED,
    });

    const result = await service.grant(ctx, 'CONSENT-ABC', {});

    expect(result.status).toBe(ConsentRequestStatus.GRANTED);
  });

  it('revokes consent', async () => {
    prisma.consentArtifact.findFirst.mockResolvedValue({
      id: 'consent-1',
      status: ConsentRequestStatus.GRANTED,
    });
    prisma.consentArtifact.update.mockResolvedValue({
      id: 'consent-1',
      status: ConsentRequestStatus.REVOKED,
    });

    const result = await service.revoke(ctx, 'CONSENT-ABC', {});

    expect(result.status).toBe(ConsentRequestStatus.REVOKED);
  });

  it('rejects granting non-requested consent', async () => {
    prisma.consentArtifact.findFirst.mockResolvedValue({
      id: 'consent-1',
      status: ConsentRequestStatus.GRANTED,
    });

    await expect(service.grant(ctx, 'CONSENT-ABC', {})).rejects.toThrow(BadRequestException);
  });
});
