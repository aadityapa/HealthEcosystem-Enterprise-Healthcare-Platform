import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller('api/v1/inventory')
export class HealthController {
  @Get('health')
  @ApiOperation({ summary: 'Service health check' })
  health() {
    return { status: 'ok', service: 'inventory-service' };
  }
}
