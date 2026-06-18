import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { CoreServicesModule } from './services/core-services.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';
import { ExecutiveModule } from './modules/executive/executive.module';
import { RevenueModule } from './modules/revenue/revenue.module';
import { BranchesModule } from './modules/branches/branches.module';
import { TestsModule } from './modules/tests/tests.module';
import { ReferralsModule } from './modules/referrals/referrals.module';
import { QcModule } from './modules/qc/qc.module';
import { DevicesModule } from './modules/devices/devices.module';
import { PredictiveModule } from './modules/predictive/predictive.module';
import { DashboardsModule } from './modules/dashboards/dashboards.module';
import { ViewsModule } from './modules/views/views.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    CoreServicesModule,
    ExecutiveModule,
    RevenueModule,
    BranchesModule,
    TestsModule,
    ReferralsModule,
    QcModule,
    DevicesModule,
    PredictiveModule,
    DashboardsModule,
    ViewsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
