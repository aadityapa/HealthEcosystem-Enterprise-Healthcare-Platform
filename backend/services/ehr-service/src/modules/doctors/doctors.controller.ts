import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { DoctorsService } from './doctors.service';
import {
  CreateDoctorDto,
  ListDoctorsQueryDto,
  UpdateDoctorDto,
} from './dto/doctors.dto';

@ApiTags('EHR Doctors')
@Controller('api/v1/ehr/doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'List doctors' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() pagination: PaginationDto,
    @Query() filters: ListDoctorsQueryDto,
  ) {
    return this.doctorsService.list(ctx, {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create doctor' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateDoctorDto) {
    return this.doctorsService.create(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get doctor by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.doctorsService.get(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update doctor' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDoctorDto,
  ) {
    return this.doctorsService.update(ctx, id, dto);
  }
}
