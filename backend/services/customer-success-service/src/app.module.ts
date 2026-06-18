import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { MigrationModule } from './modules/migration/migration.module';
import { TrainingModule } from './modules/training/training.module';
import { KnowledgeModule } from './modules/knowledge/knowledge.module';
import { TicketsModule } from './modules/tickets/tickets.module';
import { SlaModule } from './modules/sla/sla.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    OnboardingModule,
    MigrationModule,
    TrainingModule,
    KnowledgeModule,
    TicketsModule,
    SlaModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
