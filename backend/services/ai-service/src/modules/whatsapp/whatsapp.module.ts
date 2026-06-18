import { Module } from '@nestjs/common';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';

@Module({
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
})
export class WhatsAppModule {}
