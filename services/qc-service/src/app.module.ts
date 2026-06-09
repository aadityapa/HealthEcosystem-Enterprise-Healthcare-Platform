import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';
import { QcServicesModule } from './services/qc-services.module';
import { MaterialsModule } from './modules/materials/materials.module';
import { RunsModule } from './modules/runs/runs.module';
import { CalibrationModule } from './modules/calibration/calibration.module';
import { CapaModule } from './modules/capa/capa.module';
import { ChartsModule } from './modules/charts/charts.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    QcServicesModule,
    MaterialsModule,
    RunsModule,
    CalibrationModule,
    CapaModule,
    ChartsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
