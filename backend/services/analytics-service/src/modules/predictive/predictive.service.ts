import { Inject, Injectable } from '@nestjs/common';
import { type PrismaClient } from '@health/db';
import { PRISMA } from '@/database/database.module';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { DateRangeQueryDto, parseDateRange, toNumber } from '@/common/dto/analytics-query.dto';
import { ClickHouseService } from '@/services/clickhouse.service';

@Injectable()
export class PredictiveService {
  constructor(
    @Inject(PRISMA) private readonly prisma: PrismaClient,
    private readonly clickhouse: ClickHouseService,
  ) {}

  async getForecasts(ctx: ServiceRequestContext, query: DateRangeQueryDto) {
    const { from, to } = parseDateRange(query);
    const chSql = `
      SELECT
        model_type,
        forecast_date,
        predicted_value,
        confidence
      FROM analytics.fact_forecasts
      WHERE tenant_id = {tenantId:UUID}
        AND forecast_date >= {from:DateTime}
        AND forecast_date <= {to:DateTime}
      ORDER BY forecast_date
    `;

    const { data, source } = await this.clickhouse.queryWithFallback(
      { tenantId: ctx.tenantId, userId: ctx.userId },
      'predictive_forecasts',
      chSql,
      { tenantId: ctx.tenantId, from, to },
      () => this.fetchForecastsFromPostgres(ctx, from, to),
    );

    return {
      forecasts: Array.isArray(data) ? data : data.forecasts,
      models: Array.isArray(data) ? [] : data.models,
      source,
      period: { from: from.toISOString(), to: to.toISOString() },
    };
  }

  private async fetchForecastsFromPostgres(
    ctx: ServiceRequestContext,
    from: Date,
    to: Date,
  ) {
    const models = await this.prisma.predictiveModel.findMany({
      where: {
        tenantId: ctx.tenantId,
        isActive: true,
      },
      orderBy: { modelType: 'asc' },
    });

    const days = Math.max(1, Math.ceil((to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000)));
    const forecasts = models.flatMap((model) => {
      const config = model.config as { baseValue?: number; growthRate?: number };
      const baseValue = config.baseValue ?? 1000;
      const growthRate = config.growthRate ?? 0.02;
      const accuracy = toNumber(model.accuracy) || 85;

      return Array.from({ length: Math.min(days, 30) }, (_, i) => {
        const forecastDate = new Date(from.getTime() + i * 24 * 60 * 60 * 1000);
        return {
          modelType: model.modelType,
          modelName: model.name,
          forecastDate: forecastDate.toISOString().slice(0, 10),
          predictedValue: Math.round(baseValue * Math.pow(1 + growthRate, i)),
          confidence: accuracy,
        };
      });
    });

    return {
      models: models.map((m) => ({
        id: m.id,
        modelType: m.modelType,
        name: m.name,
        version: m.version,
        accuracy: toNumber(m.accuracy),
        lastTrainedAt: m.lastTrainedAt,
      })),
      forecasts,
    };
  }
}
