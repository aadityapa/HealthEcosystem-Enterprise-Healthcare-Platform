import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';
import { SecurityServicesModule } from './services/security-services.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { IncidentsModule } from './modules/incidents/incidents.module';
import { ThreatsModule } from './modules/threats/threats.module';
import { SiemModule } from './modules/siem/siem.module';
import { VulnerabilitiesModule } from './modules/vulnerabilities/vulnerabilities.module';
import { PentestModule } from './modules/pentest/pentest.module';
import { CertificatesModule } from './modules/certificates/certificates.module';
import { SecretsModule } from './modules/secrets/secrets.module';
import { WafModule } from './modules/waf/waf.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    SecurityServicesModule,
    DashboardModule,
    IncidentsModule,
    ThreatsModule,
    SiemModule,
    VulnerabilitiesModule,
    PentestModule,
    CertificatesModule,
    SecretsModule,
    WafModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
