import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ServiceMapService } from './service-map.service';

class ServiceMapQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(168)
  sinceHours?: number = 24;
}

@ApiTags('Observability Service Map')
@Controller('api/v1/observability/service-map')
export class ServiceMapController {
  constructor(private readonly serviceMapService: ServiceMapService) {}

  @Get()
  @ApiOperation({ summary: 'Get service dependency graph from traces' })
  getServiceMap(
    @ServiceContext() _ctx: ServiceRequestContext,
    @Query() query: ServiceMapQueryDto,
  ) {
    return this.serviceMapService.buildGraph(query.sinceHours);
  }
}
