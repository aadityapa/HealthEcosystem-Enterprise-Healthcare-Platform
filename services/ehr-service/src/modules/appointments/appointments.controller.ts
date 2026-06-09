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
import { AppointmentsService } from './appointments.service';
import {
  CancelAppointmentDto,
  CreateAppointmentDto,
  ListAppointmentsQueryDto,
} from './dto/appointments.dto';

@ApiTags('EHR Appointments')
@Controller('api/v1/ehr/appointments')
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List appointments' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() pagination: PaginationDto,
    @Query() filters: ListAppointmentsQueryDto,
  ) {
    return this.appointmentsService.list(ctx, {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create appointment' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateAppointmentDto) {
    return this.appointmentsService.create(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get appointment by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.appointmentsService.get(ctx, id);
  }

  @Post(':id/check-in')
  @ApiOperation({ summary: 'Check in patient for appointment' })
  checkIn(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.appointmentsService.checkIn(ctx, id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: 'Cancel appointment' })
  cancel(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CancelAppointmentDto,
  ) {
    return this.appointmentsService.cancel(ctx, id, dto);
  }
}
