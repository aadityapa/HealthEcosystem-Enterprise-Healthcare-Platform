import { Inject, Injectable } from '@nestjs/common';
import { createEvent, type EventPublisher } from '@health/events';
import { EVENT_TYPES } from '@health/shared-types';
import { createLogger } from '@health/logger';
import type { MasterRequestContext } from '@/common/context/master-context';
import { EVENT_PUBLISHER } from '@/events/events.constants';

const logger = createLogger({ service: 'master-data-service-events' });

@Injectable()
export class MasterEventsService {
  constructor(@Inject(EVENT_PUBLISHER) private readonly publisher: EventPublisher) {}

  async publishUpdated(
    ctx: MasterRequestContext,
    entityType: string,
    entityId: string,
    action: 'created' | 'updated' | 'deleted',
    data?: Record<string, unknown>,
  ): Promise<void> {
    const event = createEvent(
      EVENT_TYPES.MASTER_DATA_UPDATED,
      entityType,
      entityId,
      ctx.tenantId,
      { action, entityType, entityId, ...data },
      {
        organizationId: ctx.organizationId,
        branchId: ctx.branchId,
        userId: ctx.userId,
      },
    );

    await this.publisher.publish(event);
    logger.info(
      `Master data event published: ${EVENT_TYPES.MASTER_DATA_UPDATED} ${entityType}/${entityId} (${action})`,
    );
  }
}
