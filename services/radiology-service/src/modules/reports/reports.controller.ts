import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ReportsService } from './reports.service';
import { CreateReportDto, ReleaseReportDto, VerifyReportDto } from './dto/reports.dto';

@ApiTags('Radiology Reports')
@Controller('api/v1/radiology/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post('studies/:studyId')
  @ApiOperation({ summary: 'Create radiology report' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('studyId', ParseUUIDPipe) studyId: string,
    @Body() dto: CreateReportDto,
  ) {
    return this.reportsService.create(ctx, studyId, dto);
  }

  @Get('studies/:studyId')
  @ApiOperation({ summary: 'Get report by study' })
  getByStudy(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('studyId', ParseUUIDPipe) studyId: string,
  ) {
    return this.reportsService.getByStudy(ctx, studyId);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify radiology report' })
  verify(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: VerifyReportDto,
  ) {
    return this.reportsService.verify(ctx, id, dto);
  }

  @Post(':id/release')
  @ApiOperation({ summary: 'Release radiology report' })
  release(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReleaseReportDto,
  ) {
    return this.reportsService.release(ctx, id, dto);
  }
}
