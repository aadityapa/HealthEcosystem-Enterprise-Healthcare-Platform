import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { DicomService } from './dicom.service';
import { DicomStoreDto, ListInstancesQueryDto } from './dto/dicom.dto';

@ApiTags('Radiology DICOM')
@Controller('api/v1/radiology/dicom')
export class DicomController {
  constructor(private readonly dicomService: DicomService) {}

  @Post('store')
  @ApiOperation({ summary: 'C-STORE stub — ingest DICOM instance' })
  store(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: DicomStoreDto) {
    return this.dicomService.store(ctx, dto);
  }

  @Get('instances')
  @ApiOperation({ summary: 'List DICOM instances' })
  listInstances(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListInstancesQueryDto,
  ) {
    return this.dicomService.listInstances(ctx, filters);
  }
}
