import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Gender } from '@health/db';
import { PatientService } from './patient.service';
import { PRISMA } from '@/database/database.module';

jest.mock('@health/db', () => {
  const actual = jest.requireActual('@health/db');
  return {
    ...actual,
    setTenantContext: jest.fn().mockResolvedValue(undefined),
  };
});

describe('PatientService', () => {
  let service: PatientService;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let prisma: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let tx: any;

  const tenantId = 'tenant-1';
  const organizationId = 'org-1';
  const branchId = 'branch-1';
  const userId = 'user-1';

  beforeEach(async () => {
    tx = {
      branch: {
        findFirst: jest.fn().mockResolvedValue({ code: 'AND' }),
      },
      uhidSequence: {
        findUnique: jest.fn(),
        upsert: jest.fn(),
        update: jest.fn(),
      },
      patient: {
        create: jest.fn(),
      },
      patientTimelineEvent: {
        create: jest.fn(),
      },
      patientVisit: {
        count: jest.fn().mockResolvedValue(0),
        create: jest.fn(),
      },
    };

    prisma = {
      patient: {
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn(),
        count: jest.fn(),
        update: jest.fn(),
      },
      patientTimelineEvent: {
        create: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
      patientConsent: { create: jest.fn() },
      patientVisit: { findMany: jest.fn(), count: jest.fn() },
      patientDocument: { findMany: jest.fn(), create: jest.fn() },
      family: { upsert: jest.fn() },
      familyMember: { upsert: jest.fn() },
      $transaction: jest.fn(async (fn: (client: typeof tx) => Promise<unknown>) =>
        fn(tx),
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PatientService,
        { provide: PRISMA, useValue: prisma },
      ],
    }).compile();

    service = module.get(PatientService);
  });

  describe('buildUhid', () => {
    it('formats UHID as branchCode + YYMM + 6-digit sequence', () => {
      expect(service.buildUhid('AND', '2506', 1)).toBe('AND2506000001');
      expect(service.buildUhid('AND', '2506', 42)).toBe('AND2506000042');
      expect(service.buildUhid('AND', '2506', 999999)).toBe('AND2506999999');
    });
  });

  describe('formatYymm', () => {
    it('returns two-digit year and month', () => {
      expect(service.formatYymm(new Date('2025-06-08T00:00:00Z'))).toBe('2506');
      expect(service.formatYymm(new Date('2026-01-15T00:00:00Z'))).toBe('2601');
    });
  });

  describe('generateUhid', () => {
    it('creates first sequence for new branch/month prefix', async () => {
      tx.uhidSequence.findUnique.mockResolvedValue(null);
      tx.uhidSequence.upsert.mockResolvedValue({
        tenantId,
        branchId,
        prefix: 'AND2506',
        lastSeq: 1,
      });

      const referenceDate = new Date('2025-06-08T00:00:00Z');
      const uhid = await service.generateUhid(
        tx as never,
        tenantId,
        branchId,
        referenceDate,
      );

      expect(uhid).toBe('AND2506000001');
      expect(tx.uhidSequence.upsert).toHaveBeenCalledWith({
        where: { tenantId_branchId: { tenantId, branchId } },
        create: { tenantId, branchId, prefix: 'AND2506', lastSeq: 1 },
        update: { prefix: 'AND2506', lastSeq: 1 },
      });
    });

    it('increments sequence when prefix matches current month', async () => {
      tx.uhidSequence.findUnique.mockResolvedValue({
        tenantId,
        branchId,
        prefix: 'AND2506',
        lastSeq: 5,
      });
      tx.uhidSequence.update.mockResolvedValue({
        tenantId,
        branchId,
        prefix: 'AND2506',
        lastSeq: 6,
      });

      const uhid = await service.generateUhid(
        tx as never,
        tenantId,
        branchId,
        new Date('2025-06-08T00:00:00Z'),
      );

      expect(uhid).toBe('AND2506000006');
      expect(tx.uhidSequence.update).toHaveBeenCalledWith({
        where: { tenantId_branchId: { tenantId, branchId } },
        data: { lastSeq: { increment: 1 } },
      });
    });

    it('resets sequence when month changes', async () => {
      tx.uhidSequence.findUnique.mockResolvedValue({
        tenantId,
        branchId,
        prefix: 'AND2505',
        lastSeq: 99,
      });
      tx.uhidSequence.upsert.mockResolvedValue({
        tenantId,
        branchId,
        prefix: 'AND2506',
        lastSeq: 1,
      });

      const uhid = await service.generateUhid(
        tx as never,
        tenantId,
        branchId,
        new Date('2025-06-08T00:00:00Z'),
      );

      expect(uhid).toBe('AND2506000001');
      expect(tx.uhidSequence.upsert).toHaveBeenCalled();
    });

    it('throws when branch is not found', async () => {
      tx.branch.findFirst.mockResolvedValue(null);

      await expect(
        service.generateUhid(tx as never, tenantId, branchId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('registerPatient', () => {
    const payload = {
      tenantId,
      organizationId,
      branchId,
      userId,
      firstName: 'Ravi',
      lastName: 'Kumar',
      phone: '9876543210',
      gender: Gender.MALE,
    };

    it('registers patient with generated UHID and timeline event', async () => {
      const yymm = service.formatYymm(new Date());
      const expectedUhid = service.buildUhid('AND', yymm, 1);

      tx.uhidSequence.findUnique.mockResolvedValue(null);
      tx.uhidSequence.upsert.mockResolvedValue({
        prefix: `AND${yymm}`,
        lastSeq: 1,
      });

      const createdPatient = {
        id: 'patient-1',
        uhid: expectedUhid,
        ...payload,
      };

      tx.patient.create.mockResolvedValue(createdPatient);
      tx.patientTimelineEvent.create.mockResolvedValue({ id: 'event-1' });

      const result = await service.registerPatient(payload);

      expect(result).toEqual(createdPatient);
      expect(tx.patient.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId,
            organizationId,
            branchId,
            uhid: expectedUhid,
            firstName: 'Ravi',
            phone: '9876543210',
            registeredBranchId: branchId,
            createdBy: userId,
          }),
        }),
      );
      expect(tx.patientTimelineEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            patientId: 'patient-1',
            eventType: 'patient.registered',
            title: 'Patient registered',
          }),
        }),
      );
    });

    it('rejects duplicate phone within tenant', async () => {
      prisma.patient.findFirst.mockResolvedValue({ id: 'existing' });

      await expect(service.registerPatient(payload)).rejects.toThrow(
        ConflictException,
      );
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
