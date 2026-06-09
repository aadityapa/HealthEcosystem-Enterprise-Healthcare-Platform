import { Global, Module } from '@nestjs/common';
import { InMemoryEventPublisher } from '@health/events';
import type { EventPublisher } from '@health/events';
import { MasterEventsService } from '@/common/services/master-events.service';
import { EVENT_PUBLISHER } from './events.constants';

@Global()
@Module({
  providers: [
    {
      provide: EVENT_PUBLISHER,
      useClass: InMemoryEventPublisher,
    },
    MasterEventsService,
  ],
  exports: [EVENT_PUBLISHER, MasterEventsService],
})
export class EventsModule {}
