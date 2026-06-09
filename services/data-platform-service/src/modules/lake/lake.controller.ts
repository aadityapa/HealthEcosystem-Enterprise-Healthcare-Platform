import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { LakeService } from './lake.service';
import { IngestLakeDto, ListLakeObjectsQueryDto } from './dto/lake.dto';

@ApiTags('Data Lake')
@Controller('api/v1/data/lake')
export class LakeController {
  constructor(private readonly lakeService: LakeService) {}

  @Get('objects')
  @ApiOperation({ summary: 'List data lake objects' })
  listObjects(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: ListLakeObjectsQueryDto,
  ) {
    return this.lakeService.listObjects(ctx, query);
  }

  @Post('ingest')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Ingest Kafka events to S3 data lake (stub)' })
  ingest(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: IngestLakeDto,
  ) {
    return this.lakeService.ingest(ctx, dto);
  }
}
