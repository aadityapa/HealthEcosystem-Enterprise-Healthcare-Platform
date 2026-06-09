import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';
import { PhlebotomistsModule } from './modules/phlebotomists/phlebotomists.module';
import { RoutesModule } from './modules/routes/routes.module';
import { StopsModule } from './modules/stops/stops.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { AttendanceModule } from './modules/attendance/attendance.module';
import { GeofencesModule } from './modules/geofences/geofences.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    PhlebotomistsModule,
    RoutesModule,
    StopsModule,
    TrackingModule,
    AttendanceModule,
    GeofencesModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
