import { Module } from '@nestjs/common';
import { ProtocolHandlerService } from './protocol-handler.service';

@Module({
  providers: [ProtocolHandlerService],
  exports: [ProtocolHandlerService],
})
export class ProtocolsModule {}
