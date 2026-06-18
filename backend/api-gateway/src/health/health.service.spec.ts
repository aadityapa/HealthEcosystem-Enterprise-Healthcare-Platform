import { ConfigService } from '@nestjs/config';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it('returns live status', async () => {
    const service = new HealthService(new ConfigService());
    await expect(service.checkLive()).resolves.toEqual({
      status: 'ok',
      service: 'api-gateway',
    });
  });
});
