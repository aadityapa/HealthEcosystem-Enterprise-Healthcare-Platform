import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { CoreServicesModule } from './services/core-services.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { TestMasterModule } from './modules/test-master/test-master.module';
import { OrdersModule } from './modules/orders/orders.module';
import { SamplesModule } from './modules/samples/samples.module';
import { ResultsModule } from './modules/results/results.module';
import { ReportsModule } from './modules/reports/reports.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    CoreServicesModule,
    TestMasterModule,
    OrdersModule,
    SamplesModule,
    ResultsModule,
    ReportsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
