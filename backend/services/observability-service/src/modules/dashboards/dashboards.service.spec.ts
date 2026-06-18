import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DashboardsService } from './dashboards.service';

describe('DashboardsService', () => {
  let service: DashboardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardsService,
        {
          provide: ConfigService,
          useValue: { get: jest.fn().mockReturnValue('https://grafana.example.com') },
        },
      ],
    }).compile();

    service = module.get(DashboardsService);
  });

  it('returns Grafana embed URLs', () => {
    const result = service.listEmbedUrls();

    expect(result.grafanaBaseUrl).toBe('https://grafana.example.com');
    expect(result.dashboards.length).toBeGreaterThanOrEqual(4);
    expect(result.dashboards[0].embedUrl).toContain('grafana.example.com');
  });
});
