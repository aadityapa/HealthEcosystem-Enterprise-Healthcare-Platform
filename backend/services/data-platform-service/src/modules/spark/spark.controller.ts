import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { SparkService } from './spark.service';
import { SubmitSparkJobDto } from './dto/spark.dto';

@ApiTags('Spark Jobs')
@Controller('api/v1/data/spark')
export class SparkController {
  constructor(private readonly sparkService: SparkService) {}

  @Post('jobs')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Submit Spark job (stub)' })
  submitJob(
    @ServiceContext() _ctx: ServiceRequestContext,
    @Body() dto: SubmitSparkJobDto,
  ) {
    return this.sparkService.submitJob(dto);
  }
}
