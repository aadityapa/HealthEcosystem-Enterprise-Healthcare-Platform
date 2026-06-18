import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';
import { I18nServicesModule } from './services/i18n-services.module';
import { CountriesModule } from './modules/countries/countries.module';
import { TranslationsModule } from './modules/translations/translations.module';
import { TenantLocaleModule } from './modules/tenant-locale/tenant-locale.module';
import { TaxRulesModule } from './modules/tax-rules/tax-rules.module';
import { CurrencyModule } from './modules/currency/currency.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    I18nServicesModule,
    CountriesModule,
    TranslationsModule,
    TenantLocaleModule,
    TaxRulesModule,
    CurrencyModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
