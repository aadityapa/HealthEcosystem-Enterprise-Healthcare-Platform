import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import { isPublicRoute } from '@/config/public-routes';

@Injectable()
export class RateLimitMiddleware implements NestMiddleware, OnModuleInit, OnModuleDestroy {
  private readonly redis: Redis;
  private readonly limiter: RateLimiterRedis;

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('redisUrl', 'redis://localhost:6379');
    this.redis = new Redis(redisUrl, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    this.limiter = new RateLimiterRedis({
      storeClient: this.redis,
      keyPrefix: 'api_gw_rl',
      points: this.configService.get<number>('rateLimitPoints', 120),
      duration: this.configService.get<number>('rateLimitDurationSec', 60),
      blockDuration: 0,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.redis.connect();
  }

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const pathname = req.originalUrl.split('?')[0] ?? req.path;

    if (isPublicRoute(pathname) && pathname.startsWith('/health')) {
      next();
      return;
    }

    const clientIp = req.ip ?? req.socket.remoteAddress ?? 'unknown';
    const key = `${clientIp}:${req.method}:${pathname.split('/').slice(0, 4).join('/')}`;

    try {
      const result = await this.limiter.consume(key);
      res.setHeader('X-RateLimit-Limit', this.configService.get<number>('rateLimitPoints', 120));
      res.setHeader('X-RateLimit-Remaining', result.remainingPoints);
      res.setHeader('X-RateLimit-Reset', new Date(Date.now() + result.msBeforeNext).toISOString());
      next();
    } catch {
      next(
        new HttpException(
          {
            success: false,
            error: {
              code: 'RATE_LIMIT_EXCEEDED',
              message: 'Too many requests. Please try again later.',
            },
          },
          HttpStatus.TOO_MANY_REQUESTS,
        ),
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.redis.quit();
  }
}
