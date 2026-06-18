import { Module } from '@nestjs/common';
import { SecurityServicesModule } from '@/services/security-services.module';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [SecurityServicesModule],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
