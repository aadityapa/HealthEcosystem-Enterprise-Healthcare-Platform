import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PrescriptionsService } from './prescriptions.service';
import { PRISMA } from '@/database/database.module';
import { EhrSequenceService } from '@/services/ehr-sequence.service';

describe('PrescriptionsService', () => {
  let service: PrescriptionsService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      consultation: { findFirst: jest.fn() },
      prescription: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PrescriptionsService,
        { provide: PRISMA, useValue: prisma },
        { provide: EhrSequenceService, useValue: { next: jest.fn().mockReturnValue('RX-ABC') } },
      ],
    }).compile();

    service = module.get<PrescriptionsService>(PrescriptionsService);
  });

  it('creates prescription with lines', async () => {
    prisma.consultation.findFirst.mockResolvedValue({ id: 'con-1' });
    prisma.prescription.create.mockResolvedValue({
      id: 'rx-1',
      prescriptionNumber: 'RX-ABC',
      lines: [{ drugName: 'Paracetamol' }],
    });

    const result = await service.create(ctx, {
      consultationId: 'con-1',
      doctorId: 'doc-1',
      patientId: 'pat-1',
      lines: [{ drugName: 'Paracetamol', dosage: '500mg' }],
    });

    expect(result.prescriptionNumber).toBe('RX-ABC');
    expect(result.lines).toHaveLength(1);
  });

  it('rejects prescription without lines', async () => {
    await expect(
      service.create(ctx, {
        consultationId: 'con-1',
        doctorId: 'doc-1',
        patientId: 'pat-1',
        lines: [],
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws NotFoundException when consultation is missing', async () => {
    prisma.consultation.findFirst.mockResolvedValue(null);

    await expect(
      service.create(ctx, {
        consultationId: 'con-1',
        doctorId: 'doc-1',
        patientId: 'pat-1',
        lines: [{ drugName: 'Paracetamol' }],
      }),
    ).rejects.toThrow(NotFoundException);
  });
});
