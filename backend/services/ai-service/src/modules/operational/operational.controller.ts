import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { OperationalService } from './operational.service';
import { ForecastDto, StaffPlanningDto } from './dto/operational.dto';

@ApiTags('AI Operational')
@Controller('api/v1/ai/operational')
export class OperationalController {
  constructor(private readonly operationalService: OperationalService) {}

  @Post('inventory-forecast')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forecast inventory demand using moving average' })
  inventoryForecast(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: ForecastDto,
  ) {
    return this.operationalService.inventoryForecast(ctx, dto);
  }

  @Post('demand-forecast')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forecast test demand using moving average' })
  demandForecast(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: ForecastDto,
  ) {
    return this.operationalService.demandForecast(ctx, dto);
  }

  @Post('revenue-forecast')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forecast revenue using moving average' })
  revenueForecast(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: ForecastDto,
  ) {
    return this.operationalService.revenueForecast(ctx, dto);
  }

  @Post('staff-planning')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Recommend staffing levels from expected volume' })
  staffPlanning(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: StaffPlanningDto,
  ) {
    return this.operationalService.staffPlanning(ctx, dto);
  }
}
