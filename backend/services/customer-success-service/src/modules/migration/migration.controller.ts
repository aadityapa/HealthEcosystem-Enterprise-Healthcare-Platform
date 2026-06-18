import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { MigrationService } from './migration.service';
import { CreateMigrationJobDto, ListMigrationJobsQueryDto } from './dto/migration.dto';

@ApiTags('Customer Success Migration')
@Controller('api/v1/customer-success/migration')
export class MigrationController {
  constructor(private readonly migrationService: MigrationService) {}

  @Post('jobs')
  @ApiOperation({ summary: 'Create data import job' })
  createJob(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateMigrationJobDto) {
    return this.migrationService.createJob(ctx, dto);
  }

  @Get('jobs')
  @ApiOperation({ summary: 'List data import jobs' })
  listJobs(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: ListMigrationJobsQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.migrationService.listJobs(ctx, query, pagination.page, pagination.limit);
  }
}
