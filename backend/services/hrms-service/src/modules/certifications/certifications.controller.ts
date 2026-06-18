import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { CertificationsService } from './certifications.service';
import {
  CreateCertificationDto,
  ListCertificationsQueryDto,
} from './dto/certifications.dto';

@ApiTags('HRMS Certifications')
@Controller('api/v1/hrms/certifications')
export class CertificationsController {
  constructor(private readonly certificationsService: CertificationsService) {}

  @Post()
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateCertificationDto) {
    return this.certificationsService.create(ctx, dto);
  }

  @Get()
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListCertificationsQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.certificationsService.list(ctx, filters, pagination.page, pagination.limit);
  }

  @Get(':id')
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.certificationsService.getById(ctx, id);
  }
}
