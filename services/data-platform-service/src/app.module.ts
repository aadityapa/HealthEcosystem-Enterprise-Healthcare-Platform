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
import { PipelinesModule } from './modules/pipelines/pipelines.module';
import { LakeModule } from './modules/lake/lake.module';
import { WarehouseModule } from './modules/warehouse/warehouse.module';
import { SparkModule } from './modules/spark/spark.module';
import { ExportsModule } from './modules/exports/exports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    CoreServicesModule,
    PipelinesModule,
    LakeModule,
    WarehouseModule,
    SparkModule,
    ExportsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
