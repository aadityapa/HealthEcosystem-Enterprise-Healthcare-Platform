import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { TracesService } from './traces.service';
import { IngestSpansDto } from './dto/traces.dto';

@ApiTags('Observability Traces')
@Controller('api/v1/observability/traces')
export class TracesController {
  constructor(private readonly tracesService: TracesService) {}

  @Post('spans')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Ingest OpenTelemetry span batch' })
  ingestSpans(@Body() dto: IngestSpansDto) {
    return this.tracesService.ingestSpans(dto);
  }

  @Get(':traceId')
  @ApiOperation({ summary: 'Get trace by ID' })
  getTrace(
    @ServiceContext() _ctx: ServiceRequestContext,
    @Param('traceId') traceId: string,
  ) {
    return this.tracesService.getTrace(traceId);
  }
}
