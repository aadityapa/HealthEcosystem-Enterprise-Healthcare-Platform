import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { AttendanceService } from './attendance.service';
import { CheckInDto, CheckOutDto } from './dto/attendance.dto';

@ApiTags('HRMS Attendance')
@Controller('api/v1/hrms/attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post('check-in')
  @ApiOperation({ summary: 'Employee check-in' })
  checkIn(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CheckInDto) {
    return this.attendanceService.checkIn(ctx, dto);
  }

  @Post('check-out')
  @ApiOperation({ summary: 'Employee check-out' })
  checkOut(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CheckOutDto) {
    return this.attendanceService.checkOut(ctx, dto);
  }
}
