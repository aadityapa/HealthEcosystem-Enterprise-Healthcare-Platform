import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CqrsModule } from '@nestjs/cqrs';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { ResponseTransformInterceptor } from './common/interceptors/response-transform.interceptor';
import { HealthController } from './health.controller';
import { DocumentsModule } from './modules/documents/documents.module';
import { VersionsModule } from './modules/versions/versions.module';
import { SignaturesModule } from './modules/signatures/signatures.module';
import { OcrModule } from './modules/ocr/ocr.module';
import { SearchModule } from './modules/search/search.module';
import { RetentionModule } from './modules/retention/retention.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CqrsModule,
    DatabaseModule,
    RedisModule,
    DocumentsModule,
    VersionsModule,
    SignaturesModule,
    OcrModule,
    SearchModule,
    RetentionModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TenantContextInterceptor },
    { provide: APP_INTERCEPTOR, useClass: ResponseTransformInterceptor },
  ],
})
export class AppModule {}
