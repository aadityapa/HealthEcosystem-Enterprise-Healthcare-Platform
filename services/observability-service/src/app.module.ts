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
import { HealthModule } from './modules/health/health.module';
import { TracesModule } from './modules/traces/traces.module';
import { SlaModule } from './modules/sla/sla.module';
import { ServiceMapModule } from './modules/service-map/service-map.module';
import { CapacityModule } from './modules/capacity/capacity.module';
import { DashboardsModule } from './modules/dashboards/dashboards.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    CoreServicesModule,
    HealthModule,
    TracesModule,
    SlaModule,
    ServiceMapModule,
    CapacityModule,
    DashboardsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
