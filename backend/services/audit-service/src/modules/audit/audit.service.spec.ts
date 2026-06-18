import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { AuditAction } from '@health/db';
import { AuditService } from './audit.service';
import { AuditRepository } from './audit.repository';

describe('AuditService', () => {
  let service: AuditService;
  let repository: {
    create: jest.Mock;
    findMany: jest.Mock;
    findForExport: jest.Mock;
  };

  const mockAuditLog = {
    id: 'log-1',
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
    action: AuditAction.UPDATE,
    entityType: 'patient',
    entityId: 'patient-1',
    oldValue: { name: 'Old' },
    newValue: { name: 'New' },
    ipAddress: '127.0.0.1',
    userAgent: 'jest',
    requestId: 'req-1',
    metadata: {},
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
  };

  beforeEach(async () => {
    repository = {
      create: jest.fn().mockResolvedValue(mockAuditLog),
      findMany: jest.fn().mockResolvedValue({
        items: [mockAuditLog],
        total: 1,
      }),
      findForExport: jest.fn().mockResolvedValue({
        items: [mockAuditLog],
        truncated: false,
        total: 1,
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        { provide: AuditRepository, useValue: repository },
        { provide: CommandBus, useValue: { execute: jest.fn() } },
        { provide: QueryBus, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
  });

  describe('createLog', () => {
    it('should append an immutable audit log entry', async () => {
      const result = await service.createLog({
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        branchId: 'branch-1',
        userId: 'user-1',
        action: AuditAction.UPDATE,
        entityType: 'patient',
        entityId: 'patient-1',
        oldValue: { name: 'Old' },
        newValue: { name: 'New' },
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
        requestId: 'req-1',
      });

      expect(repository.create).toHaveBeenCalledWith({
        tenantId: 'tenant-1',
        organizationId: 'org-1',
        branchId: 'branch-1',
        userId: 'user-1',
        action: AuditAction.UPDATE,
        entityType: 'patient',
        entityId: 'patient-1',
        oldValue: { name: 'Old' },
        newValue: { name: 'New' },
        ipAddress: '127.0.0.1',
        userAgent: 'jest',
        requestId: 'req-1',
        metadata: {},
      });
      expect(result.id).toBe('log-1');
      expect(result.action).toBe(AuditAction.UPDATE);
    });

    it('should default metadata to empty object', async () => {
      await service.createLog({
        tenantId: 'tenant-1',
        action: AuditAction.CREATE,
        entityType: 'order',
      });

      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ metadata: {} }),
      );
    });
  });

  describe('queryLogs', () => {
    it('should return paginated audit logs filtered by tenant', async () => {
      const result = await service.queryLogs({
        tenantId: 'tenant-1',
        userId: 'user-1',
        entityType: 'patient',
        page: 1,
        limit: 20,
        dateRange: {
          from: new Date('2026-06-01'),
          to: new Date('2026-06-30'),
        },
      });

      expect(repository.findMany).toHaveBeenCalledWith(
        {
          tenantId: 'tenant-1',
          userId: 'user-1',
          organizationId: undefined,
          branchId: undefined,
          entityType: 'patient',
          entityId: undefined,
          action: undefined,
          dateRange: {
            from: new Date('2026-06-01'),
            to: new Date('2026-06-30'),
          },
        },
        1,
        20,
      );
      expect(result.items).toHaveLength(1);
      expect(result.meta.total).toBe(1);
      expect(result.meta.page).toBe(1);
    });
  });

  describe('exportLogs', () => {
    it('should return compliance export with metadata', async () => {
      const result = await service.exportLogs({
        tenantId: 'tenant-1',
        entityType: 'patient',
        maxRecords: 5000,
        exportedBy: 'compliance-officer-1',
      });

      expect(repository.findForExport).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: 'tenant-1',
          entityType: 'patient',
        }),
        5000,
      );
      expect(result.recordCount).toBe(1);
      expect(result.totalMatching).toBe(1);
      expect(result.truncated).toBe(false);
      expect(result.exportedBy).toBe('compliance-officer-1');
      expect(result.exportId).toBeDefined();
      expect(result.exportedAt).toBeDefined();
    });
  });
});
