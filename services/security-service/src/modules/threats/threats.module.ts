import { Module } from '@nestjs/common';
import { SecurityServicesModule } from '@/services/security-services.module';
import { ThreatsController } from './threats.controller';
import { ThreatsService } from './threats.service';

@Module({
  imports: [SecurityServicesModule],
  controllers: [ThreatsController],
  providers: [ThreatsService],
})
export class ThreatsModule {}
