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
import { ConsultationsService } from './consultations.service';
import {
  AddClinicalNoteDto,
  CompleteConsultationDto,
  CreateConsultationDto,
  ListConsultationsQueryDto,
} from './dto/consultations.dto';

@ApiTags('EHR Consultations')
@Controller('api/v1/ehr/consultations')
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Get()
  @ApiOperation({ summary: 'List consultations' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() pagination: PaginationDto,
    @Query() filters: ListConsultationsQueryDto,
  ) {
    return this.consultationsService.list(ctx, {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create consultation' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateConsultationDto) {
    return this.consultationsService.create(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get consultation by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.consultationsService.get(ctx, id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start consultation' })
  start(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.consultationsService.start(ctx, id);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete consultation' })
  complete(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CompleteConsultationDto,
  ) {
    return this.consultationsService.complete(ctx, id, dto);
  }

  @Post(':id/clinical-notes')
  @ApiOperation({ summary: 'Add clinical note to consultation' })
  addClinicalNote(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddClinicalNoteDto,
  ) {
    return this.consultationsService.addClinicalNote(ctx, id, dto);
  }
}
