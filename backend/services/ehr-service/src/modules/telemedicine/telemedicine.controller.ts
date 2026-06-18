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
import { TelemedicineService } from './telemedicine.service';
import {
  EndTeleconsultDto,
  ListTeleconsultQueryDto,
  ScheduleTeleconsultDto,
} from './dto/telemedicine.dto';

@ApiTags('EHR Telemedicine')
@Controller('api/v1/ehr/telemedicine')
export class TelemedicineController {
  constructor(private readonly telemedicineService: TelemedicineService) {}

  @Get()
  @ApiOperation({ summary: 'List teleconsult sessions' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() pagination: PaginationDto,
    @Query() filters: ListTeleconsultQueryDto,
  ) {
    return this.telemedicineService.list(ctx, {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Post('schedule')
  @ApiOperation({ summary: 'Schedule teleconsult session' })
  schedule(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: ScheduleTeleconsultDto) {
    return this.telemedicineService.schedule(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get teleconsult session by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.telemedicineService.get(ctx, id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: 'Start teleconsult session' })
  start(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.telemedicineService.start(ctx, id);
  }

  @Post(':id/end')
  @ApiOperation({ summary: 'End teleconsult session' })
  end(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: EndTeleconsultDto,
  ) {
    return this.telemedicineService.end(ctx, id, dto);
  }
}
