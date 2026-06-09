import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';
import { BrandsModule } from './modules/brands/brands.module';
import { ThemesModule } from './modules/themes/themes.module';
import { FeaturesModule } from './modules/features/features.module';
import { FranchiseModule } from './modules/franchise/franchise.module';
import { MobileModule } from './modules/mobile/mobile.module';
import { ResolveModule } from './modules/resolve/resolve.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    BrandsModule,
    ThemesModule,
    FeaturesModule,
    FranchiseModule,
    MobileModule,
    ResolveModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
