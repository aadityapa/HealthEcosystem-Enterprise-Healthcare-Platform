import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';
import { AgentsModule } from './modules/agents/agents.module';
import { PatientAgentModule } from './modules/patient-agent/patient-agent.module';
import { DoctorAgentModule } from './modules/doctor-agent/doctor-agent.module';
import { LabAgentModule } from './modules/lab-agent/lab-agent.module';
import { ManagementAgentModule } from './modules/management-agent/management-agent.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    AgentsModule,
    PatientAgentModule,
    DoctorAgentModule,
    LabAgentModule,
    ManagementAgentModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
