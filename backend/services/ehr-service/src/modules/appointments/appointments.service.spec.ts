import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AppointmentStatus } from '@health/db';
import { AppointmentsService } from './appointments.service';
import { PRISMA } from '@/database/database.module';
import { EhrSequenceService } from '@/services/ehr-sequence.service';

describe('AppointmentsService', () => {
  let service: AppointmentsService;
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
      appointment: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentsService,
        { provide: PRISMA, useValue: prisma },
        { provide: EhrSequenceService, useValue: { next: jest.fn().mockReturnValue('APT-ABC') } },
      ],
    }).compile();

    service = module.get<AppointmentsService>(AppointmentsService);
  });

  it('creates appointment when doctor exists', async () => {
    prisma.ehrDoctor.findFirst.mockResolvedValue({ id: 'doc-1' });
    prisma.appointment.create.mockResolvedValue({ id: 'apt-1', appointmentNumber: 'APT-ABC' });

    const result = await service.create(ctx, {
      patientId: 'pat-1',
      doctorId: 'doc-1',
      scheduledAt: '2026-06-08T10:00:00Z',
    });

    expect(result.appointmentNumber).toBe('APT-ABC');
  });

  it('throws NotFoundException when doctor is missing', async () => {
    prisma.ehrDoctor.findFirst.mockResolvedValue(null);

    await expect(
      service.create(ctx, {
        patientId: 'pat-1',
        doctorId: 'doc-1',
        scheduledAt: '2026-06-08T10:00:00Z',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('checks in a scheduled appointment', async () => {
    prisma.appointment.findFirst.mockResolvedValue({
      id: 'apt-1',
      status: AppointmentStatus.SCHEDULED,
    });
    prisma.appointment.update.mockResolvedValue({
      id: 'apt-1',
      status: AppointmentStatus.CHECKED_IN,
    });

    const result = await service.checkIn(ctx, 'apt-1');

    expect(result.status).toBe(AppointmentStatus.CHECKED_IN);
  });

  it('rejects check-in for completed appointment', async () => {
    prisma.appointment.findFirst.mockResolvedValue({
      id: 'apt-1',
      status: AppointmentStatus.COMPLETED,
    });

    await expect(service.checkIn(ctx, 'apt-1')).rejects.toThrow(BadRequestException);
  });
});
