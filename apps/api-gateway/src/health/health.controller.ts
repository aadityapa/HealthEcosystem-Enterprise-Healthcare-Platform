import { Controller, Get, HttpCode, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Aggregated platform health' })
  async health() {
    const result = await this.healthService.checkReady();
    return { success: true, data: result };
  }

  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe' })
  async live() {
    const data = await this.healthService.checkLive();
    return { success: true, data };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe with upstream checks' })
  async ready() {
    const data = await this.healthService.checkReady();

    if (data.status === 'down') {
      throw new ServiceUnavailableException({
        success: false,
        data,
      });
    }

    return { success: true, data };
  }
}
