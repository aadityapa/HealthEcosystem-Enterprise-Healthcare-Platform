import { Inject, Injectable } from '@nestjs/common';
import {
  DeviceStatus,
  DeviceEventType,
  type Device,
  type Prisma,
  type PrismaClient,
} from '@health/db';
import { PRISMA } from '@/database/database.module';
import { RetryQueueService } from '../queue/retry-queue.service';
import { DeadLetterQueueService } from '../queue/dead-letter-queue.service';

export interface HealthMetrics {
  messagesPerMin: number;
  errorRate: number;
  queueDepth: number;
  dlqDepth: number;
  latencyMs: number;
}

@Injectable()
export class DeviceMonitoringService {
  private readonly messageTimestamps = new Map<string, number[]>();

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly retryQueue: RetryQueueService,
    private readonly deadLetterQueue: DeadLetterQueueService,
  ) {}

  async recordHeartbeat(device: Device): Promise<void> {
    await this.prisma.device.update({
      where: { id: device.id },
      data: { lastSeenAt: new Date(), status: DeviceStatus.ONLINE },
    });

    await this.prisma.deviceEvent.create({
      data: {
        tenantId: device.tenantId,
        organizationId: device.organizationId,
        branchId: device.branchId,
        deviceId: device.id,
        eventType: DeviceEventType.HEARTBEAT,
        payload: { timestamp: new Date().toISOString() },
      },
    });
  }

  trackMessage(deviceId: string): void {
    const now = Date.now();
    const timestamps = this.messageTimestamps.get(deviceId) ?? [];
    timestamps.push(now);
    const oneMinuteAgo = now - 60_000;
    this.messageTimestamps.set(
      deviceId,
      timestamps.filter((t) => t >= oneMinuteAgo),
    );
  }

  async recordHealthSnapshot(
    device: Device,
    latencyMs: number,
    errorCount: number,
    totalCount: number,
  ): Promise<HealthMetrics> {
    const messagesPerMin = (this.messageTimestamps.get(device.id) ?? []).length;
    const queueDepth = await this.retryQueue.depth();
    const dlqDepth = await this.deadLetterQueue.depth(device.tenantId);
    const errorRate = totalCount > 0 ? errorCount / totalCount : 0;

    const metrics: HealthMetrics = {
      messagesPerMin,
      errorRate,
      queueDepth,
      dlqDepth,
      latencyMs,
    };

    await this.prisma.deviceHealth.create({
      data: {
        tenantId: device.tenantId,
        organizationId: device.organizationId,
        branchId: device.branchId,
        deviceId: device.id,
        status: device.status,
        messagesPerMin,
        errorRate,
        queueDepth,
        dlqDepth,
        latencyMs,
        metrics: metrics as unknown as Prisma.InputJsonValue,
      },
    });

    return metrics;
  }

  async getLatestHealth(deviceId: string, tenantId: string) {
    return this.prisma.deviceHealth.findFirst({
      where: { deviceId, tenantId },
      orderBy: { recordedAt: 'desc' },
    });
  }

  async markOffline(device: Device): Promise<void> {
    await this.prisma.device.update({
      where: { id: device.id },
      data: { status: DeviceStatus.OFFLINE },
    });

    await this.prisma.deviceEvent.create({
      data: {
        tenantId: device.tenantId,
        organizationId: device.organizationId,
        branchId: device.branchId,
        deviceId: device.id,
        eventType: DeviceEventType.DISCONNECTED,
        payload: {},
      },
    });
  }
}
