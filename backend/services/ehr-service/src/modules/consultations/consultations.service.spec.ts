import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { ConsultationStatus } from '@health/db';
import { ConsultationsService } from './consultations.service';
import { PRISMA } from '@/database/database.module';
import { EhrSequenceService } from '@/services/ehr-sequence.service';

describe('ConsultationsService', () => {
  let service: ConsultationsService;
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
      consultation: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      clinicalNote: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsultationsService,
        { provide: PRISMA, useValue: prisma },
        { provide: EhrSequenceService, useValue: { next: jest.fn().mockReturnValue('CON-ABC') } },
      ],
    }).compile();

    service = module.get<ConsultationsService>(ConsultationsService);
  });

  it('starts a scheduled consultation', async () => {
    prisma.consultation.findFirst.mockResolvedValue({
      id: 'con-1',
      status: ConsultationStatus.SCHEDULED,
    });
    prisma.consultation.update.mockResolvedValue({
      id: 'con-1',
      status: ConsultationStatus.IN_PROGRESS,
    });

    const result = await service.start(ctx, 'con-1');

    expect(result.status).toBe(ConsultationStatus.IN_PROGRESS);
  });

  it('adds clinical note to consultation', async () => {
    prisma.consultation.findFirst.mockResolvedValue({ id: 'con-1' });
    prisma.clinicalNote.create.mockResolvedValue({
      id: 'note-1',
      noteType: 'SOAP',
      content: 'Patient stable',
    });

    const result = await service.addClinicalNote(ctx, 'con-1', {
      noteType: 'SOAP',
      content: 'Patient stable',
    });

    expect(result.noteType).toBe('SOAP');
    expect(prisma.clinicalNote.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ authoredBy: 'user-1' }),
      }),
    );
  });

  it('rejects completing consultation that is not in progress', async () => {
    prisma.consultation.findFirst.mockResolvedValue({
      id: 'con-1',
      status: ConsultationStatus.SCHEDULED,
    });

    await expect(service.complete(ctx, 'con-1', {})).rejects.toThrow(BadRequestException);
  });
});
