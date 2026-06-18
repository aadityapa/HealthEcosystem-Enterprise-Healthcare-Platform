import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS = 'REDIS';

@Global()
@Module({
  providers: [
    {
      provide: REDIS,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL', 'redis://localhost:6379');
        return new Redis(url, {
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });
      },
    },
  ],
  exports: [REDIS],
})
export class RedisModule {}
