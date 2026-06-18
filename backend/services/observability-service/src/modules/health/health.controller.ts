import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { HealthService } from './health.service';
import { ListHealthSnapshotsQueryDto } from './dto/health.dto';

@ApiTags('Observability Health')
@Controller('api/v1/observability/health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get('snapshots')
  @ApiOperation({ summary: 'List service health snapshots' })
  listSnapshots(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: ListHealthSnapshotsQueryDto,
  ) {
    return this.healthService.listSnapshots(ctx, query);
  }
}
