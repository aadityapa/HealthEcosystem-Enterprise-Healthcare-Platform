import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { GatewayConfig, ServiceTarget } from '@/config/configuration';

export type ServiceHealthStatus = 'up' | 'down' | 'degraded';

export interface ServiceHealthResult {
  name: string;
  status: ServiceHealthStatus;
  latencyMs: number;
  url: string;
  error?: string;
}

export interface AggregatedHealth {
  status: ServiceHealthStatus;
  service: string;
  timestamp: string;
  uptimeSeconds: number;
  services: ServiceHealthResult[];
}

@Injectable()
export class HealthService {
  private readonly startedAt = Date.now();

  constructor(private readonly configService: ConfigService) {}

  async checkLive(): Promise<{ status: 'ok'; service: string }> {
    return { status: 'ok', service: 'api-gateway' };
  }

  async checkReady(): Promise<AggregatedHealth> {
    const services = this.configService.get<GatewayConfig['services']>('services', []);
    const results = await Promise.all(services.map((service) => this.probeService(service)));

    const downCount = results.filter((r) => r.status === 'down').length;
    const overall: ServiceHealthStatus =
      downCount === 0 ? 'up' : downCount === results.length ? 'down' : 'degraded';

    return {
      status: overall,
      service: 'api-gateway',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor((Date.now() - this.startedAt) / 1000),
      services: results,
    };
  }

  private async probeService(service: ServiceTarget): Promise<ServiceHealthResult> {
    const url = `${service.baseUrl}${service.healthPath}`;
    const started = Date.now();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5_000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
        headers: { accept: 'application/json' },
      });

      clearTimeout(timeout);
      const latencyMs = Date.now() - started;

      if (!response.ok) {
        return {
          name: service.name,
          status: 'down',
          latencyMs,
          url,
          error: `HTTP ${response.status}`,
        };
      }

      return {
        name: service.name,
        status: 'up',
        latencyMs,
        url,
      };
    } catch (error) {
      return {
        name: service.name,
        status: 'down',
        latencyMs: Date.now() - started,
        url,
        error: error instanceof Error ? error.message : 'Probe failed',
      };
    }
  }
}
