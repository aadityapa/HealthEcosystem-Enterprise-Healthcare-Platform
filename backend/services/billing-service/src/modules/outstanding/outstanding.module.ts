import { Module } from '@nestjs/common';
import { CoreServicesModule } from '@/services/core-services.module';
import { OutstandingController } from './outstanding.controller';

@Module({
  imports: [CoreServicesModule],
  controllers: [OutstandingController],
})
export class OutstandingModule {}
