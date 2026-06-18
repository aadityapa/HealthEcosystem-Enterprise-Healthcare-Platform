import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { AttendanceService } from './attendance.service';
import { CheckInDto, CheckOutDto, ListAttendanceDto } from './dto/attendance.dto';

@ApiTags('Field Attendance')
@Controller('api/v1/field/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @ApiOperation({ summary: 'Check in with geofence validation' })
  checkIn(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(ctx, dto);
  }

  @Post('check-out')
  @ApiOperation({ summary: 'Check out' })
  checkOut(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CheckOutDto) {
    return this.attendanceService.checkOut(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List attendance records' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: ListAttendanceDto) {
    return this.attendanceService.list(ctx, query);
  }
}
