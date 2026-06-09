import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ChartsService } from './charts.service';

class LeveyJenningsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 50;
}

@ApiTags('QC Charts')
@Controller('api/v1/qc/charts')
export class ChartsController {
  constructor(private readonly chartsService: ChartsService) {}

  @Get('levey-jennings/:materialId')
  @ApiOperation({ summary: 'Get Levey-Jennings chart data for a material' })
  getLeveyJennings(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('materialId', ParseUUIDPipe) materialId: string,
    @Query() query: LeveyJenningsQueryDto,
  ) {
    return this.chartsService.getLeveyJennings(ctx, materialId, query.limit);
  }
}
