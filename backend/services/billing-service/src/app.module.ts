import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { KafkaModule } from './kafka/kafka.module';
import { CoreServicesModule } from './services/core-services.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { CorporateModule } from './modules/corporate/corporate.module';
import { InsuranceModule } from './modules/insurance/insurance.module';
import { FranchiseModule } from './modules/franchise/franchise.module';
import { GstModule } from './modules/gst/gst.module';
import { OutstandingModule } from './modules/outstanding/outstanding.module';
import { SurchargesModule } from './modules/surcharges/surcharges.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    KafkaModule,
    CoreServicesModule,
    InvoicesModule,
    PaymentsModule,
    CorporateModule,
    InsuranceModule,
    FranchiseModule,
    GstModule,
    OutstandingModule,
    SurchargesModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
