import { SlaService } from './sla.service';

describe('SlaService', () => {
  const ctx = {
    tenantId: 'tenant-1',
    organizationId: 'org-1',
    branchId: 'branch-1',
    userId: 'user-1',
  };

  let service: SlaService;

  beforeEach(() => {
    service = new SlaService();
  });

  it('returns SLA dashboard stub', () => {
    const result = service.getDashboard(ctx);
    expect(result.source).toBe('observability-stub');
    expect(result.metrics.length).toBeGreaterThan(0);
  });

  it('includes summary with service count', () => {
    const result = service.getDashboard(ctx);
    expect(result.summary.servicesMonitored).toBe(result.metrics.length);
    expect(result.summary.avgUptimePct).toBeGreaterThan(0);
  });

  it('provides grafana dashboard link', () => {
    const result = service.getDashboard(ctx);
    expect(result.grafanaDashboardUrl).toContain('sla-error-budgets');
  });
});
