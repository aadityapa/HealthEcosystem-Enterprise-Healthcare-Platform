import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface GrafanaDashboardEmbed {
  id: string;
  title: string;
  embedUrl: string;
  panelId?: string;
}

@Injectable()
export class DashboardsService {
  constructor(private readonly config: ConfigService) {}

  listEmbedUrls(): { dashboards: GrafanaDashboardEmbed[]; grafanaBaseUrl: string } {
    const grafanaBaseUrl =
      this.config.get<string>('GRAFANA_URL') ?? 'http://localhost:3000';

    const dashboards: GrafanaDashboardEmbed[] = [
      {
        id: 'platform-overview',
        title: 'Platform Overview',
        embedUrl: `${grafanaBaseUrl}/d/platform-overview?orgId=1&kiosk`,
      },
      {
        id: 'lims-operations',
        title: 'LIMS Operations',
        embedUrl: `${grafanaBaseUrl}/d/lims-operations?orgId=1&kiosk`,
      },
      {
        id: 'device-health',
        title: 'Device Health',
        embedUrl: `${grafanaBaseUrl}/d/device-health?orgId=1&kiosk`,
        panelId: '1',
      },
      {
        id: 'sla-error-budgets',
        title: 'SLA Error Budgets',
        embedUrl: `${grafanaBaseUrl}/d/sla-error-budgets?orgId=1&kiosk`,
      },
    ];

    return { dashboards, grafanaBaseUrl };
  }
}
