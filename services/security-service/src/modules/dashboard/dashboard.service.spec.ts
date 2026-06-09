import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { PRISMA } from '@/database/database.module';
import { CertificateMonitorService } from '@/services/certificate-monitor.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let prisma: Record<string, Record<string, jest.Mock>>;

  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  beforeEach(async () => {
    prisma = {
      securityIncident: { count: jest.fn() },
      threatDetection: { count: jest.fn() },
      vulnerabilityFinding: { count: jest.fn() },
      certificateRecord: { findMany: jest.fn() },
      secretRotationLog: { findMany: jest.fn() },
    };

    prisma.securityIncident.count
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1);
    prisma.threatDetection.count.mockResolvedValue(2);
    prisma.vulnerabilityFinding.count.mockResolvedValue(5);
    prisma.certificateRecord.findMany.mockResolvedValue([
      {
        id: 'cert-1',
        domain: 'api.example.com',
        validTo: new Date(Date.now() + 10 * 86400000),
      },
    ]);
    prisma.secretRotationLog.findMany.mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        CertificateMonitorService,
        { provide: PRISMA, useValue: prisma },
      ],
    }).compile();

    service = module.get(DashboardService);
  });

  it('returns SOC overview with framework readiness scores', async () => {
    const result = await service.getOverview(ctx);

    expect(result.incidents.open).toBe(3);
    expect(result.threats.unacknowledged).toBe(2);
    expect(result.complianceFrameworks.iso27001).toBeDefined();
    expect(result.complianceFrameworks.soc2).toBeDefined();
    expect(result.complianceFrameworks.hipaa).toBeDefined();
  });

  it('includes certificate expiry alerts', async () => {
    const result = await service.getOverview(ctx);

    expect(result.certificates.total).toBe(1);
    expect(result.certificates.expiringWithin30Days).toBeGreaterThanOrEqual(0);
  });
});
