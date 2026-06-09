import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { PRISMA } from '@/database/database.module';

describe('TenantService', () => {
  let service: TenantService;
  let prisma: Record<string, unknown>;

  const mockTenant = {
    id: 'tenant-1',
    slug: 'acme-labs',
    name: 'Acme Labs',
    tier: 'PROFESSIONAL',
    status: 'TRIAL',
    settings: {},
    dataRegion: 'ap-south-1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrganization = {
    id: 'org-1',
    tenantId: 'tenant-1',
    legalName: 'Acme Diagnostics Pvt Ltd',
    tradeName: 'Acme Labs',
    gstin: null,
    pan: null,
    orgType: 'diagnostic',
    settings: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prisma = {
      tenant: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue(mockTenant),
      },
      organization: {
        findFirst: jest.fn(),
        create: jest.fn().mockResolvedValue(mockOrganization),
      },
      branch: {
        findFirst: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        count: jest.fn(),
      },
      department: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
      franchiseAgreement: {
        findFirst: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantService,
        { provide: PRISMA, useValue: prisma },
      ],
    }).compile();

    service = module.get<TenantService>(TenantService);
  });

  describe('createTenant', () => {
    it('should create a tenant when slug is available', async () => {
      (prisma.tenant as { findUnique: jest.Mock }).findUnique.mockResolvedValue(null);

      const result = await service.createTenant({
        slug: 'acme-labs',
        name: 'Acme Labs',
      });

      expect(result.slug).toBe('acme-labs');
      expect((prisma.tenant as { create: jest.Mock }).create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          slug: 'acme-labs',
          name: 'Acme Labs',
          settings: {},
        }),
      });
    });

    it('should throw ConflictException when slug already exists', async () => {
      (prisma.tenant as { findUnique: jest.Mock }).findUnique.mockResolvedValue(mockTenant);

      await expect(
        service.createTenant({ slug: 'acme-labs', name: 'Acme Labs' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('createOrganization', () => {
    it('should create organization with tenant_id set', async () => {
      (prisma.tenant as { findUnique: jest.Mock }).findUnique.mockResolvedValue(mockTenant);
      (prisma.organization as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);

      const result = await service.createOrganization({
        tenantId: 'tenant-1',
        legalName: 'Acme Diagnostics Pvt Ltd',
      });

      expect(result.tenantId).toBe('tenant-1');
      expect((prisma.organization as { create: jest.Mock }).create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          tenantId: 'tenant-1',
          legalName: 'Acme Diagnostics Pvt Ltd',
          orgType: 'diagnostic',
        }),
      });
    });

    it('should throw NotFoundException when tenant does not exist', async () => {
      (prisma.tenant as { findUnique: jest.Mock }).findUnique.mockResolvedValue(null);

      await expect(
        service.createOrganization({
          tenantId: 'missing-tenant',
          legalName: 'Acme Diagnostics Pvt Ltd',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getTenant', () => {
    it('should return tenant by slug', async () => {
      (prisma.tenant as { findFirst: jest.Mock }).findFirst.mockResolvedValue({
        ...mockTenant,
        organizations: [],
      });

      const result = await service.getTenant('acme-labs');
      expect(result.slug).toBe('acme-labs');
    });

    it('should throw NotFoundException when tenant is missing', async () => {
      (prisma.tenant as { findFirst: jest.Mock }).findFirst.mockResolvedValue(null);

      await expect(service.getTenant('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
