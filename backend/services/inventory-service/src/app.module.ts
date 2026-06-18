import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';
import { VendorsModule } from './modules/vendors/vendors.module';
import { ItemsModule } from './modules/items/items.module';
import { StockLotsModule } from './modules/stock-lots/stock-lots.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { StockTransfersModule } from './modules/stock-transfers/stock-transfers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    VendorsModule,
    ItemsModule,
    StockLotsModule,
    PurchaseOrdersModule,
    StockTransfersModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
