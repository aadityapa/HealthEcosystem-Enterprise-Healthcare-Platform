import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { LimsContext } from '@/common/decorators/lims.decorators';
import type { LimsRequestContext } from '@/common/context/lims-context';
import { GenerateReportDto, ReleaseReportDto, ListReportsQueryDto } from './dto/reports.dto';
import {
  GenerateReportCommand,
  ReleaseReportCommand,
  GetReportQuery,
  ListReportsQuery,
} from './commands/reports.commands';
import { ReportsService } from './reports.service';

@ApiTags('Reports')
@Controller('api/v1/lims/reports')
export class ReportsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly reportsService: ReportsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List reports' })
  listReports(
    @LimsContext() ctx: LimsRequestContext,
    @Query() filters: ListReportsQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListReportsQuery(ctx, { ...filters, page: pagination.page, limit: pagination.limit }),
    );
  }

  @Post('generate/:sampleId')
  @ApiOperation({ summary: 'Generate report for sample' })
  generateReport(
    @LimsContext() ctx: LimsRequestContext,
    @Param('sampleId', ParseUUIDPipe) sampleId: string,
    @Body() dto: GenerateReportDto,
  ) {
    return this.commandBus.execute(new GenerateReportCommand(ctx, sampleId, dto));
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Get report download URL' })
  async downloadReport(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const report = await this.reportsService.getReport(ctx, id);
    if (!report.pdfS3Key) {
      throw new NotFoundException('Report PDF not available');
    }

    return {
      reportId: report.id,
      reportNumber: report.reportNumber,
      pdfS3Key: report.pdfS3Key,
      downloadUrl: `/api/v1/lims/reports/${report.id}/download`,
      status: report.status,
    };
  }

  @Post(':id/release')
  @ApiOperation({ summary: 'Release report' })
  releaseReport(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReleaseReportDto,
  ) {
    return this.commandBus.execute(new ReleaseReportCommand(ctx, id, dto));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get report detail' })
  getReport(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetReportQuery(ctx, id));
  }
}
