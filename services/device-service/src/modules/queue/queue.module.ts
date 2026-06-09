import { Module } from '@nestjs/common';
import { RetryQueueService } from './retry-queue.service';
import { DeadLetterQueueService } from './dead-letter-queue.service';

@Module({
  providers: [RetryQueueService, DeadLetterQueueService],
  exports: [RetryQueueService, DeadLetterQueueService],
})
export class QueueModule {}
