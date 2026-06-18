import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { CommonModule } from './common/common.module';
import { EventsModule } from './events/events.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { HealthController } from './health.controller';
import { TestsModule } from './modules/tests/tests.module';
import { PackagesModule } from './modules/packages/packages.module';
import { ProfilesModule } from './modules/profiles/profiles.module';
import { RateCardsModule } from './modules/rate-cards/rate-cards.module';
import { TaxModule } from './modules/tax/tax.module';
import { BillingCodesModule } from './modules/billing-codes/billing-codes.module';
import { GeographyModule } from './modules/geography/geography.module';
import { SpecialtiesModule } from './modules/specialties/specialties.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { DeviceCatalogModule } from './modules/device-catalog/device-catalog.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    CommonModule,
    EventsModule,
    TestsModule,
    PackagesModule,
    ProfilesModule,
    RateCardsModule,
    TaxModule,
    BillingCodesModule,
    GeographyModule,
    SpecialtiesModule,
    DepartmentsModule,
    DeviceCatalogModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
  ],
})
export class AppModule {}
