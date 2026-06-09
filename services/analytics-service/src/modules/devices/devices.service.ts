import { Inject, Injectable } from '@nestjs/common';
import { DeviceStatus, type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import {
  BranchFilterQueryDto,
  parseDateRange,
} from '@/common/dto/analytics-query.dto';
import { ClickHouseService } from '@/services/clickhouse.service';

@Injectable()
export class DevicesAnalyticsService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly clickhouse: ClickHouseService,
  ) {}

  async getDeviceAnalytics(ctx: ServiceRequestContext, query: BranchFilterQueryDto) {
    const { from, to } = parseDateRange(query);
    const chSql = `
      SELECT
        device_id,
        count() AS message_count,
        avg(uptime_pct) AS uptime_pct
      FROM analytics.fact_device_metrics
      WHERE tenant_id = {tenantId:UUID}
        AND recorded_at >= {from:DateTime}
        AND recorded_at <= {to:DateTime}
        ${query.branchId ? 'AND branch_id = {branchId:UUID}' : ''}
      GROUP BY device_id
    `;

    const { data, source } = await this.clickhouse.queryWithFallback(
      { tenantId: ctx.tenantId, userId: ctx.userId },
      'device_analytics',
      chSql,
      { tenantId: ctx.tenantId, from, to, branchId: query.branchId },
      () => this.fetchDevicesFromPostgres(ctx, from, to, query.branchId),
    );

    const devices = Array.isArray(data) ? data : data.devices;
    const summary = Array.isArray(data)
      ? {
          totalDevices: devices.length,
          onlineDevices: devices.filter(
            (d: DeviceRow) => (d.status ?? d.uptime_pct) === DeviceStatus.ONLINE || Number(d.uptime_pct) > 95,
          ).length,
          totalMessages: devices.reduce(
            (sum: number, d: DeviceRow) => sum + Number(d.message_count ?? d.messageCount ?? 0),
            0,
          ),
        }
      : data.summary;

    return {
      devices,
      summary,
      source,
      period: { from: from.toISOString(), to: to.toISOString() },
    };
  }

  private async fetchDevicesFromPostgres(
    ctx: ServiceRequestContext,
    from: Date,
    to: Date,
    branchId?: string,
  ) {
    const deviceWhere = {
      tenantId: ctx.tenantId,
      isActive: true,
      ...(branchId && { branchId }),
    };

    const devices = await this.prisma.device.findMany({
      where: deviceWhere,
      select: {
        id: true,
        deviceCode: true,
        name: true,
        status: true,
        lastSeenAt: true,
        branchId: true,
      },
    });

    const messageCounts = await this.prisma.deviceMessage.groupBy({
      by: ['deviceId'],
      where: {
        tenantId: ctx.tenantId,
        receivedAt: { gte: from, lte: to },
        ...(branchId && { branchId }),
      },
      _count: { _all: true },
    });

    const messageMap = new Map(
      messageCounts.map((m) => [m.deviceId, m._count._all]),
    );

    const enriched = devices.map((device) => {
      const messageCount = messageMap.get(device.id) ?? 0;
      const uptimePct = device.status === DeviceStatus.ONLINE ? 99.5 : 85.0;
      return {
        deviceId: device.id,
        deviceCode: device.deviceCode,
        name: device.name,
        status: device.status,
        branchId: device.branchId,
        messageCount,
        uptimePct,
        lastSeenAt: device.lastSeenAt,
      };
    });

    return {
      devices: enriched,
      summary: {
        totalDevices: enriched.length,
        onlineDevices: enriched.filter((d) => d.status === DeviceStatus.ONLINE).length,
        totalMessages: enriched.reduce((s, d) => s + d.messageCount, 0),
      },
    };
  }
}

interface DeviceRow {
  status?: string;
  uptime_pct?: number;
  message_count?: number;
  messageCount?: number;
}
