import { Injectable } from '@nestjs/common';
import type { ServiceRequestContext } from '@/common/context/request-context';

export interface CustomerSlaMetric {
  serviceName: string;
  targetUptimePct: number;
  currentUptimePct: number;
  errorBudgetRemainingPct: number;
  status: 'healthy' | 'at_risk' | 'breached';
  windowDays: number;
}

@Injectable()
export class SlaService {
  getDashboard(_ctx: ServiceRequestContext) {
    const metrics: CustomerSlaMetric[] = [
      {
        serviceName: 'lims-service',
        targetUptimePct: 99.9,
        currentUptimePct: 99.95,
        errorBudgetRemainingPct: 85,
        status: 'healthy',
        windowDays: 30,
      },
      {
        serviceName: 'billing-service',
        targetUptimePct: 99.5,
        currentUptimePct: 99.2,
        errorBudgetRemainingPct: 42,
        status: 'at_risk',
        windowDays: 30,
      },
      {
        serviceName: 'patient-service',
        targetUptimePct: 99.9,
        currentUptimePct: 99.88,
        errorBudgetRemainingPct: 60,
        status: 'healthy',
        windowDays: 30,
      },
    ];

    const breachedCount = metrics.filter((m) => m.status === 'breached').length;
    const atRiskCount = metrics.filter((m) => m.status === 'at_risk').length;
    const avgUptime =
      metrics.reduce((sum, m) => sum + m.currentUptimePct, 0) / metrics.length;

    return {
      source: 'observability-stub',
      summary: {
        servicesMonitored: metrics.length,
        avgUptimePct: Number(avgUptime.toFixed(2)),
        atRiskCount,
        breachedCount,
      },
      metrics,
      grafanaDashboardUrl: 'http://localhost:3000/d/sla-error-budgets?orgId=1&kiosk',
    };
  }
}
