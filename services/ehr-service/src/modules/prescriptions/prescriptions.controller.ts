import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { PrescriptionsService } from './prescriptions.service';
import {
  CreatePrescriptionDto,
  ListPrescriptionsQueryDto,
} from './dto/prescriptions.dto';

@ApiTags('EHR Prescriptions')
@Controller('api/v1/ehr/prescriptions')
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Get()
  @ApiOperation({ summary: 'List prescriptions' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() pagination: PaginationDto,
    @Query() filters: ListPrescriptionsQueryDto,
  ) {
    return this.prescriptionsService.list(ctx, {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create prescription with lines' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prescription by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.prescriptionsService.get(ctx, id);
  }
}
