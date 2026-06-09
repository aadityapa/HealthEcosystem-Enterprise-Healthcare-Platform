import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { FhirResourceType } from '@health/db';
import { FhirService } from './fhir.service';
import { PRISMA } from '@/database/database.module';

describe('FhirService', () => {
  let service: FhirService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      fhirResource: {
        upsert: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [FhirService, { provide: PRISMA, useValue: prisma }],
    }).compile();

    service = module.get<FhirService>(FhirService);
  });

  it('creates FHIR resource', async () => {
    prisma.fhirResource.upsert.mockResolvedValue({
      id: 'fhir-1',
      resourceType: FhirResourceType.Patient,
      resourceId: 'pat-1',
    });

    const result = await service.create(ctx, {
      resourceType: FhirResourceType.Patient,
      resourceId: 'pat-1',
      content: { resourceType: 'Patient', id: 'pat-1' },
    });

    expect(result.resourceId).toBe('pat-1');
  });

  it('throws NotFoundException when resource is missing', async () => {
    prisma.fhirResource.findFirst.mockResolvedValue(null);

    await expect(
      service.get(ctx, FhirResourceType.Patient, 'missing'),
    ).rejects.toThrow(NotFoundException);
  });

  it('ingests FHIR R4 bundle entries', async () => {
    prisma.fhirResource.upsert.mockResolvedValue({
      id: 'fhir-1',
      resourceType: FhirResourceType.Observation,
      resourceId: 'obs-1',
    });

    const result = await service.ingestBundle(ctx, {
      bundle: {
        resourceType: 'Bundle',
        type: 'collection',
        entry: [
          {
            resource: {
              resourceType: 'Observation',
              id: 'obs-1',
              subject: { reference: 'Patient/pat-1' },
            },
          },
        ],
      },
    });

    expect(result.entryCount).toBe(1);
  });

  it('rejects non-bundle payloads', async () => {
    await expect(
      service.ingestBundle(ctx, {
        bundle: { resourceType: 'Patient', id: 'pat-1' },
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
