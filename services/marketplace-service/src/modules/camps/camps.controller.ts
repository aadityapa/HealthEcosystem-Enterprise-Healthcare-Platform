import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { CampsService } from './camps.service';
import { CreateCampBookingDto, ListCampBookingsQueryDto } from './dto/camps.dto';

@ApiTags('Marketplace Camps')
@Controller('api/v1/marketplace/camps')
export class CampsController {
  constructor(private readonly campsService: CampsService) {}

  @Post('bookings')
  @ApiOperation({ summary: 'Create camp booking' })
  createBooking(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateCampBookingDto,
  ) {
    return this.campsService.createBooking(ctx, dto);
  }

  @Get('bookings')
  @ApiOperation({ summary: 'List camp bookings' })
  listBookings(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListCampBookingsQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.campsService.listBookings(ctx, filters, pagination.page, pagination.limit);
  }

  @Get('bookings/:id')
  @ApiOperation({ summary: 'Get camp booking' })
  getBooking(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.campsService.getBooking(ctx, id);
  }
}
