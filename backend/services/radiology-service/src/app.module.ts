import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';
import { RadiologyServicesModule } from './services/radiology-services.module';
import { StudiesModule } from './modules/studies/studies.module';
import { DicomModule } from './modules/dicom/dicom.module';
import { PacsModule } from './modules/pacs/pacs.module';
import { ReportsModule } from './modules/reports/reports.module';
import { WorklistModule } from './modules/worklist/worklist.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    RadiologyServicesModule,
    StudiesModule,
    DicomModule,
    PacsModule,
    ReportsModule,
    WorklistModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
