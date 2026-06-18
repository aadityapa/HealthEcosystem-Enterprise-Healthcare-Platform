import { Body, Controller, Get, HttpCode, HttpStatus, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { SiemService } from './siem.service';
import { IngestSiemEventDto } from './dto/siem.dto';

class IngestSiemBatchBody {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IngestSiemEventDto)
  events!: IngestSiemEventDto[];
}

@ApiTags('Security SIEM')
@Controller('api/v1/security/siem')
export class SiemController {
  constructor(private readonly siemService: SiemService) {}

  @Post('ingest')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Ingest SIEM events' })
  ingest(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() body: IngestSiemBatchBody,
  ) {
    return this.siemService.ingest(ctx, body.events);
  }

  @Get('events')
  @ApiOperation({ summary: 'List ingested SIEM events' })
  listEvents(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: PaginationDto,
  ) {
    return this.siemService.listEvents(ctx, query);
  }
}
