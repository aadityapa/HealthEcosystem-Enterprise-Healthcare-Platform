import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DeviceEventType,
  DeviceStatus,
  MessageParseStatus,
  QueueItemStatus,
  type Device,
  type PrismaClient,
} from '@health/db';
import { createEvent, type EventPublisher } from '@health/events';
import { EVENT_TYPES } from '@health/shared-types';
import { PRISMA } from '@/database/database.module';
import { EVENT_PUBLISHER } from '../kafka/kafka.constants';
import type { DeviceRequestContext } from '@/common/context/device-context';
import { IntegrationEngineService } from '../engine/integration-engine.service';
import {
  ClinicalValidationEngineService,
  type ClinicalRange,
  type DeltaRule,
} from '../validation/clinical-validation.service';
import { DeadLetterQueueService } from '../queue/dead-letter-queue.service';
import { RetryQueueService } from '../queue/retry-queue.service';
import { DeviceMonitoringService } from '../monitor/device-monitoring.service';
import type { NormalizedResult } from '../protocols/protocol.types';

export interface ProcessMessageResult {
  messageId: string;
  resultsQueued: number;
  resultsImported: number;
  validationWarnings: string[];
}

@Injectable()
export class ResultProcessorService {
  private readonly limsBaseUrl: string;

  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    @Inject(EVENT_PUBLISHER) private readonly eventPublisher: EventPublisher,
    private readonly integrationEngine: IntegrationEngineService,
    private readonly clinicalValidation: ClinicalValidationEngineService,
    private readonly deadLetterQueue: DeadLetterQueueService,
    private readonly retryQueue: RetryQueueService,
    private readonly monitoring: DeviceMonitoringService,
    private readonly config: ConfigService,
  ) {
    this.limsBaseUrl =
      this.config.get<string>('LIMS_SERVICE_URL') ?? 'http://localhost:3004';
  }

  async processIngestion(
    ctx: DeviceRequestContext,
    device: Device,
    rawPayload: string,
  ): Promise<ProcessMessageResult> {
    const start = Date.now();
    this.monitoring.trackMessage(device.id);

    const adapterConfig = await this.prisma.deviceAdapter.findFirst({
      where: { deviceId: device.id, tenantId: ctx.tenantId, isActive: true },
    });

    const message = await this.prisma.deviceMessage.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        deviceId: device.id,
        protocol: device.protocol,
        rawPayload,
        parseStatus: MessageParseStatus.PARSING,
      },
    });

    try {
      const integration = this.integrationEngine.process(device, rawPayload, adapterConfig);

      await this.prisma.deviceMessage.update({
        where: { id: message.id },
        data: {
          parsedPayload: integration.parsed as object,
          parseStatus: MessageParseStatus.PARSED,
          parsedAt: new Date(),
          sampleBarcode: integration.sampleBarcode,
          messageControlId: integration.messageControlId,
          checksumValid: integration.checksumValid,
        },
      });

      await this.publishEvent(EVENT_TYPES.DEVICE_MESSAGE_RECEIVED, device, ctx, {
        messageId: message.id,
        protocol: device.protocol,
      });

      await this.publishEvent(EVENT_TYPES.DEVICE_RESULT_PARSED, device, ctx, {
        messageId: message.id,
        resultCount: integration.deduplicated.length,
      });

      const validationWarnings: string[] = [];
      let resultsQueued = 0;
      let resultsImported = 0;

      for (const result of integration.deduplicated) {
        const queued = await this.queueResult(ctx, device, message.id, result, adapterConfig);
        if (queued) {
          resultsQueued += 1;
          const imported = await this.importToLims(ctx, device, queued);
          if (imported) resultsImported += 1;
        }
      }

      await this.prisma.device.update({
        where: { id: device.id },
        data: { lastSeenAt: new Date(), status: DeviceStatus.ONLINE },
      });

      await this.prisma.deviceEvent.create({
        data: {
          tenantId: ctx.tenantId,
          organizationId: ctx.organizationId,
          branchId: ctx.branchId,
          deviceId: device.id,
          eventType: DeviceEventType.MESSAGE_PARSED,
          payload: { messageId: message.id, resultCount: integration.deduplicated.length },
        },
      });

      const latencyMs = Date.now() - start;
      await this.monitoring.recordHealthSnapshot(device, latencyMs, 0, 1);

      return {
        messageId: message.id,
        resultsQueued,
        resultsImported,
        validationWarnings,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown processing error';

      await this.prisma.deviceMessage.update({
        where: { id: message.id },
        data: {
          parseStatus: MessageParseStatus.FAILED,
          errorMessage,
          retryCount: { increment: 1 },
        },
      });

      await this.deadLetterQueue.push({
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        deviceId: device.id,
        sourceType: 'message',
        sourceId: message.id,
        rawPayload,
        errorMessage,
      });

      await this.publishEvent(EVENT_TYPES.DEVICE_ERROR, device, ctx, {
        messageId: message.id,
        error: errorMessage,
      });

      await this.retryQueue.enqueue({
        id: `retry-${message.id}`,
        deviceId: device.id,
        messageId: message.id,
        tenantId: ctx.tenantId,
        payload: rawPayload,
        attempt: 1,
        maxAttempts: 5,
        scheduledAt: Date.now() + 30_000,
        errorMessage,
      });

      throw error;
    }
  }

  async retryMessage(
    ctx: DeviceRequestContext,
    messageId: string,
  ): Promise<ProcessMessageResult> {
    const message = await this.prisma.deviceMessage.findFirst({
      where: { id: messageId, tenantId: ctx.tenantId },
    });
    if (!message) throw new NotFoundException('Message not found');

    const device = await this.prisma.device.findFirst({
      where: { id: message.deviceId, tenantId: ctx.tenantId },
    });
    if (!device) throw new NotFoundException('Device not found');

    await this.prisma.deviceMessage.update({
      where: { id: messageId },
      data: { parseStatus: MessageParseStatus.RETRYING },
    });

    return this.processIngestion(ctx, device, message.rawPayload);
  }

  private async queueResult(
    ctx: DeviceRequestContext,
    device: Device,
    messageId: string,
    result: NormalizedResult,
    adapterConfig: { validationRules?: unknown } | null,
  ) {
    const sample = await this.prisma.sample.findFirst({
      where: { barcode: result.sampleBarcode, tenantId: ctx.tenantId },
      include: {
        labOrderItem: {
          include: { test: { include: { parameters: true } } },
        },
      },
    });

    if (!sample) {
      return null;
    }

    const parameter = sample.labOrderItem?.test?.parameters?.find(
      (p) => p.code === result.parameterCode || p.name === result.parameterCode,
    );

    const validationRules = (adapterConfig?.validationRules ?? {}) as Record<
      string,
      ClinicalRange & { delta?: DeltaRule }
    >;
    const rule = validationRules[result.parameterCode];

    const previousResult = parameter
      ? await this.prisma.sampleResult.findFirst({
          where: {
            sampleId: sample.id,
            parameterId: parameter.id,
            tenantId: ctx.tenantId,
          },
          orderBy: { createdAt: 'desc' },
        })
      : null;

    const validation = this.clinicalValidation.validate({
      parameterCode: result.parameterCode,
      value: result.value,
      unit: result.unit,
      range: rule,
      previousValue: previousResult?.value,
      deltaRule: rule?.delta,
    });

    return this.prisma.resultQueueItem.create({
      data: {
        tenantId: ctx.tenantId,
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        deviceId: device.id,
        messageId,
        sampleBarcode: result.sampleBarcode,
        sampleId: sample.id,
        parameterCode: result.parameterCode,
        parameterId: parameter?.id,
        value: result.value,
        unit: result.unit,
        rawValue: result.rawValue,
        status: validation.isAbnormal ? QueueItemStatus.PENDING : QueueItemStatus.PENDING,
        errorMessage: validation.messages.length ? validation.messages.join('; ') : null,
      },
    });
  }

  private async importToLims(
    ctx: DeviceRequestContext,
    device: Device,
    queueItem: { id: string; sampleId: string | null; parameterId: string | null; value: string; unit: string | null; rawValue: string | null },
  ): Promise<boolean> {
    if (!queueItem.sampleId || !queueItem.parameterId) {
      await this.prisma.resultQueueItem.update({
        where: { id: queueItem.id },
        data: { status: QueueItemStatus.FAILED, errorMessage: 'Sample or parameter not matched' },
      });
      return false;
    }

    const url = `${this.limsBaseUrl}/api/v1/lims/samples/${queueItem.sampleId}/results`;
    const body = {
      results: [
        {
          parameterId: queueItem.parameterId,
          value: queueItem.value,
          unit: queueItem.unit ?? undefined,
          rawValue: queueItem.rawValue ?? undefined,
          deviceId: device.id,
        },
      ],
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': ctx.tenantId,
          'x-organization-id': ctx.organizationId,
          'x-branch-id': ctx.branchId,
          'x-user-id': ctx.userId,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new BadRequestException(`LIMS import failed: ${response.status} ${text}`);
      }

      await this.prisma.resultQueueItem.update({
        where: { id: queueItem.id },
        data: { status: QueueItemStatus.COMPLETED, processedAt: new Date() },
      });

      await this.publishEvent(EVENT_TYPES.DEVICE_RESULT_IMPORTED, device, ctx, {
        queueItemId: queueItem.id,
        sampleId: queueItem.sampleId,
      });

      await this.prisma.deviceEvent.create({
        data: {
          tenantId: ctx.tenantId,
          organizationId: ctx.organizationId,
          branchId: ctx.branchId,
          deviceId: device.id,
          eventType: DeviceEventType.RESULT_IMPORTED,
          payload: { queueItemId: queueItem.id, sampleId: queueItem.sampleId },
        },
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'LIMS import failed';
      await this.prisma.resultQueueItem.update({
        where: { id: queueItem.id },
        data: { status: QueueItemStatus.FAILED, errorMessage, retryCount: { increment: 1 } },
      });
      return false;
    }
  }

  private async publishEvent(
    eventType: string,
    device: Device,
    ctx: DeviceRequestContext,
    payload: Record<string, unknown>,
  ): Promise<void> {
    const event = createEvent(
      eventType,
      'Device',
      device.id,
      ctx.tenantId,
      payload,
      {
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        userId: ctx.userId,
      },
    );
    await this.eventPublisher.publish(event);
  }
}
