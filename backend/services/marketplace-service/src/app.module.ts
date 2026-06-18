import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';
import { ListingsModule } from './modules/listings/listings.module';
import { PartnersModule } from './modules/partners/partners.module';
import { OrdersModule } from './modules/orders/orders.module';
import { WellnessModule } from './modules/wellness/wellness.module';
import { CampsModule } from './modules/camps/camps.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    ListingsModule,
    PartnersModule,
    OrdersModule,
    WellnessModule,
    CampsModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
