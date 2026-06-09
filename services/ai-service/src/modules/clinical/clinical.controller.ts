import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ClinicalService } from './clinical.service';
import {
  AbnormalDetectDto,
  CriticalValueDto,
  InterpretDto,
  RiskPredictDto,
} from './dto/clinical.dto';

@ApiTags('AI Clinical')
@Controller('api/v1/ai/clinical')
export class ClinicalController {
  constructor(private readonly clinicalService: ClinicalService) {}

  @Post('abnormal-detect')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Detect abnormal lab values using z-score analysis' })
  abnormalDetect(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: AbnormalDetectDto,
  ) {
    return this.clinicalService.abnormalDetect(ctx, dto);
  }

  @Post('critical-value')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Evaluate critical and panic value thresholds' })
  criticalValue(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CriticalValueDto,
  ) {
    return this.clinicalService.criticalValue(ctx, dto);
  }

  @Post('interpret')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate rule-based result interpretation' })
  interpret(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: InterpretDto,
  ) {
    return this.clinicalService.interpret(ctx, dto);
  }

  @Post('risk-predict')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Predict patient risk from clinical factors' })
  riskPredict(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: RiskPredictDto,
  ) {
    return this.clinicalService.riskPredict(ctx, dto);
  }
}
