import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { TeleconsultStatus } from '@health/db';
import { TelemedicineService } from './telemedicine.service';
import { PRISMA } from '@/database/database.module';
import { EhrSequenceService } from '@/services/ehr-sequence.service';

describe('TelemedicineService', () => {
  let service: TelemedicineService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      ehrDoctor: { findFirst: jest.fn() },
      teleconsultSession: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TelemedicineService,
        { provide: PRISMA, useValue: prisma },
        { provide: EhrSequenceService, useValue: { next: jest.fn().mockReturnValue('TEL-ABC') } },
      ],
    }).compile();

    service = module.get<TelemedicineService>(TelemedicineService);
  });

  it('schedules teleconsult session', async () => {
    prisma.ehrDoctor.findFirst.mockResolvedValue({ id: 'doc-1' });
    prisma.teleconsultSession.create.mockResolvedValue({
      id: 'tel-1',
      sessionNumber: 'TEL-ABC',
    });

    const result = await service.schedule(ctx, {
      patientId: 'pat-1',
      doctorId: 'doc-1',
      scheduledAt: '2026-06-08T14:00:00Z',
    });

    expect(result.sessionNumber).toBe('TEL-ABC');
  });

  it('ends an in-call session', async () => {
    prisma.teleconsultSession.findFirst.mockResolvedValue({
      id: 'tel-1',
      status: TeleconsultStatus.IN_CALL,
    });
    prisma.teleconsultSession.update.mockResolvedValue({
      id: 'tel-1',
      status: TeleconsultStatus.COMPLETED,
    });

    const result = await service.end(ctx, 'tel-1', { recordingUrl: 'https://rec.example/1' });

    expect(result.status).toBe(TeleconsultStatus.COMPLETED);
  });

  it('rejects ending session that is not in call', async () => {
    prisma.teleconsultSession.findFirst.mockResolvedValue({
      id: 'tel-1',
      status: TeleconsultStatus.SCHEDULED,
    });

    await expect(service.end(ctx, 'tel-1', {})).rejects.toThrow(BadRequestException);
  });
});
