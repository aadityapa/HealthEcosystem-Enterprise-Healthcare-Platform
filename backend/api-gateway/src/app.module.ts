import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import configuration from '@/config/configuration';
import { HealthModule } from '@/health/health.module';
import { RequestIdMiddleware } from '@/common/middleware/request-id.middleware';
import { JwtAuthMiddleware } from '@/common/middleware/jwt-auth.middleware';
import { RateLimitMiddleware } from '@/common/middleware/rate-limit.middleware';
import { ProxyMiddleware } from '@/proxy/proxy.middleware';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    JwtModule.registerAsync({
      global: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwtSecret'),
      }),
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000,
        limit: 120,
      },
    ]),
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*');

    consumer
      .apply(RateLimitMiddleware, JwtAuthMiddleware, ProxyMiddleware)
      .forRoutes(
        { path: 'api/v1/*', method: RequestMethod.ALL },
        { path: 'api/*', method: RequestMethod.ALL },
      );
  }
}
