import {
  Inject,
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, type ClickHouseClient } from '@clickhouse/client';
import { type PrismaClient } from '@health/db';
import { createLogger } from '@health/logger';
import { PRISMA } from '@/database/database.module';

export interface AnalyticsQueryContext {
  tenantId: string;
  userId?: string;
}

export interface QueryResult<T> {
  data: T;
  source: 'clickhouse' | 'postgresql';
}

@Injectable()
export class ClickHouseService implements OnModuleInit, OnModuleDestroy {
  private client: ClickHouseClient | null = null;
  private available = false;
  private readonly logger = createLogger({ service: 'analytics-clickhouse' });

  constructor(
    private readonly config: ConfigService,
    @Inject(PRISMA) private readonly prisma: PrismaClient,
  ) {}

  async onModuleInit(): Promise<void> {
    const url = this.config.get<string>('CLICKHOUSE_URL');
    if (!url) {
      this.logger.warn('CLICKHOUSE_URL not set; using PostgreSQL aggregations');
      return;
    }

    try {
      this.client = createClient({ url });
      await this.client.ping();
      this.available = true;
      this.logger.info('ClickHouse connected');
    } catch (err) {
      this.logger.warn({ err }, 'ClickHouse unavailable; falling back to PostgreSQL');
      this.client = null;
      this.available = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      await this.client.close();
    }
  }

  isClickHouseAvailable(): boolean {
    return this.available;
  }

  async queryWithFallback<T>(
    ctx: AnalyticsQueryContext,
    queryType: string,
    chSql: string,
    chParams: Record<string, unknown>,
    fallback: () => Promise<T>,
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    let data: T;
    let source: 'clickhouse' | 'postgresql' = 'postgresql';
    let rowCount: number | undefined;

    if (this.available && this.client) {
      try {
        const result = await this.client.query({
          query: chSql,
          query_params: chParams,
          format: 'JSONEachRow',
        });
        const rows = (await result.json()) as T;
        data = rows;
        source = 'clickhouse';
        rowCount = Array.isArray(rows) ? rows.length : 1;
      } catch (err) {
        this.logger.warn({ err, queryType }, 'ClickHouse query failed; using PostgreSQL');
        data = await fallback();
      }
    } else {
      data = await fallback();
    }

    await this.logQuery(ctx, queryType, Date.now() - start, rowCount, source);
    return { data, source };
  }

  private async logQuery(
    ctx: AnalyticsQueryContext,
    queryType: string,
    durationMs: number,
    rowCount: number | undefined,
    source: 'clickhouse' | 'postgresql',
  ): Promise<void> {
    try {
      await this.prisma.analyticsQueryLog.create({
        data: {
          tenantId: ctx.tenantId,
          userId: ctx.userId,
          queryType,
          durationMs,
          rowCount,
          source,
        },
      });
    } catch (err) {
      this.logger.warn({ err, queryType }, 'Failed to log analytics query');
    }
  }
}
