import { Inject, Injectable } from '@nestjs/common';
import type { PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { CertificateMonitorService } from '@/services/certificate-monitor.service';

@Injectable()
export class DashboardService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly certificateMonitor: CertificateMonitorService,
  ) {}

  async getOverview(ctx: ServiceRequestContext) {
    const tenantFilter = { tenantId: ctx.tenantId };

    const [
      openIncidents,
      criticalIncidents,
      unacknowledgedThreats,
      openFindings,
      certificates,
      recentRotations,
    ] = await Promise.all([
      this.prisma.securityIncident.count({
        where: { ...tenantFilter, status: { in: ['OPEN', 'INVESTIGATING'] } },
      }),
      this.prisma.securityIncident.count({
        where: { ...tenantFilter, severity: 'CRITICAL', status: { not: 'CLOSED' } },
      }),
      this.prisma.threatDetection.count({
        where: { ...tenantFilter, isAcknowledged: false },
      }),
      this.prisma.vulnerabilityFinding.count({
        where: { status: 'open', scan: tenantFilter },
      }),
      this.prisma.certificateRecord.findMany({ where: tenantFilter }),
      this.prisma.secretRotationLog.findMany({
        where: tenantFilter,
        orderBy: { rotatedAt: 'desc' },
        take: 5,
      }),
    ]);

    const certStatuses = this.certificateMonitor.assessAll(certificates);
    const expiringCerts = certStatuses.filter((c) => c.alertLevel === 'warning').length;
    const expiredCerts = certStatuses.filter((c) => c.alertLevel === 'critical').length;

    return {
      incidents: {
        open: openIncidents,
        critical: criticalIncidents,
      },
      threats: {
        unacknowledged: unacknowledgedThreats,
      },
      vulnerabilities: {
        openFindings,
      },
      certificates: {
        total: certificates.length,
        expiringWithin30Days: expiringCerts,
        expired: expiredCerts,
        alerts: certStatuses.filter((c) => c.alertLevel !== 'ok'),
      },
      secrets: {
        recentRotations,
      },
      complianceFrameworks: {
        iso27001: this.readinessScore(openIncidents, unacknowledgedThreats, openFindings),
        soc2: this.readinessScore(openIncidents, unacknowledgedThreats, openFindings, 5),
        hipaa: this.readinessScore(openIncidents, unacknowledgedThreats, openFindings, 3),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  private readinessScore(
    incidents: number,
    threats: number,
    findings: number,
    penalty = 4,
  ): number {
    const deductions = incidents * penalty + threats * penalty + findings;
    return Math.max(0, Math.min(100, 100 - deductions));
  }
}
