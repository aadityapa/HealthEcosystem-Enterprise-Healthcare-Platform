import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ThreatsService } from './threats.service';
import { PRISMA } from '@/database/database.module';
import { ThreatDetectorService } from '@/services/threat-detector.service';

describe('ThreatsService', () => {
  let service: ThreatsService;
  let prisma: Record<string, Record<string, jest.Mock>>;
  let detector: ThreatDetectorService;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      threatDetection: {
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    detector = new ThreatDetectorService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThreatsService,
        { provide: PRISMA, useValue: prisma },
        { provide: ThreatDetectorService, useValue: detector },
      ],
    }).compile();

    service = module.get(ThreatsService);
  });

  it('persists detected threats', async () => {
    prisma.threatDetection.create.mockResolvedValue({
      id: 'threat-1',
      ruleName: 'suspicious_ip',
    });

    const result = await service.detect(ctx, {
      events: [
        {
          eventType: 'http.request',
          source: 'gateway',
          severity: 'low',
          message: 'Request',
          sourceIp: '10.99.1.1',
        },
      ],
    });

    expect(result.detected).toBe(1);
    expect(result.frameworks).toContain('ISO 27001');
  });

  it('acknowledges threat', async () => {
    prisma.threatDetection.findFirst.mockResolvedValue({ id: 'threat-1' });
    prisma.threatDetection.update.mockResolvedValue({ id: 'threat-1', isAcknowledged: true });

    const result = await service.acknowledge(ctx, 'threat-1');
    expect(result.isAcknowledged).toBe(true);
  });

  it('throws when acknowledging missing threat', async () => {
    prisma.threatDetection.findFirst.mockResolvedValue(null);
    await expect(service.acknowledge(ctx, 'missing')).rejects.toThrow(NotFoundException);
  });
});
