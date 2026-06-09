import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { ProcessorModule } from '../processor/processor.module';

@Module({
  imports: [ProcessorModule],
  controllers: [MessagesController],
  providers: [MessagesService],
})
export class MessagesModule {}
