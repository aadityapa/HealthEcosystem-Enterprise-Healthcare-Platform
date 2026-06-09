import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { CalibrationService } from './calibration.service';
import {
  CreateCalibrationLogDto,
  ListCalibrationQueryDto,
} from './dto/calibration.dto';

@ApiTags('QC Calibration')
@Controller('api/v1/qc/calibration')
export class CalibrationController {
  constructor(private readonly calibrationService: CalibrationService) {}

  @Post()
  @ApiOperation({ summary: 'Record device calibration' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateCalibrationLogDto) {
    return this.calibrationService.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List calibration logs' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListCalibrationQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.calibrationService.list(ctx, filters, pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get calibration log' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.calibrationService.getById(ctx, id);
  }
}
