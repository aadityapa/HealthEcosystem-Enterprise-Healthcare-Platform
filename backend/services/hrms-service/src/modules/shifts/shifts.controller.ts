import {
  Body,
  Controller,
  Delete,
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
import { ShiftsService } from './shifts.service';
import { AssignShiftDto, CreateShiftDto, UpdateShiftDto } from './dto/shifts.dto';

@ApiTags('HRMS Shifts')
@Controller('api/v1/hrms/shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post('assign')
  @ApiOperation({ summary: 'Assign shift to employee' })
  assign(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: AssignShiftDto) {
    return this.shiftsService.assign(ctx, dto);
  }

  @Post()
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateShiftDto) {
    return this.shiftsService.create(ctx, dto);
  }

  @Get()
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() pagination: PaginationDto) {
    return this.shiftsService.list(ctx, pagination.page, pagination.limit);
  }

  @Get(':id')
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.shiftsService.getById(ctx, id);
  }

  @Patch(':id')
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShiftDto,
  ) {
    return this.shiftsService.update(ctx, id, dto);
  }

  @Delete(':id')
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.shiftsService.remove(ctx, id);
  }
}
