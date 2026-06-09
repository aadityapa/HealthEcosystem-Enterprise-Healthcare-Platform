import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';
import { ComplianceServicesModule } from './services/compliance-services.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PacksModule } from './modules/packs/packs.module';
import { ControlsModule } from './modules/controls/controls.module';
import { EvidenceModule } from './modules/evidence/evidence.module';
import { RisksModule } from './modules/risks/risks.module';
import { PoliciesModule } from './modules/policies/policies.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    ComplianceServicesModule,
    DashboardModule,
    PacksModule,
    ControlsModule,
    EvidenceModule,
    RisksModule,
    PoliciesModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
