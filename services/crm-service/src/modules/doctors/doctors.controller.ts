import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { DoctorsService } from './doctors.service';
import {
  CreateDoctorDto,
  ListDoctorsQueryDto,
  UpdateDoctorDto,
} from './dto/doctors.dto';

@ApiTags('CRM Doctors')
@Controller('api/v1/crm/doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  @ApiOperation({ summary: 'List referring doctors' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: ListDoctorsQueryDto,
  ) {
    return this.doctorsService.listDoctors(ctx, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create referring doctor' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateDoctorDto,
  ) {
    return this.doctorsService.createDoctor(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get referring doctor by id' })
  getById(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.doctorsService.getDoctor(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update referring doctor' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDoctorDto,
  ) {
    return this.doctorsService.updateDoctor(ctx, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate referring doctor' })
  remove(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.doctorsService.deleteDoctor(ctx, id);
  }
}
