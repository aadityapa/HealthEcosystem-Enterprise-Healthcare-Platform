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
import { PlansService } from './plans.service';
import { CreatePlanDto, UpdatePlanDto } from './dto/plans.dto';

@ApiTags('Commercial Plans')
@Controller('api/v1/commercial/plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Post()
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreatePlanDto) {
    return this.plansService.create(ctx, dto);
  }

  @Get()
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() pagination: PaginationDto,
    @Query('includeInactive') includeInactive?: string,
  ) {
    return this.plansService.list(ctx, pagination.page, pagination.limit, includeInactive !== 'true');
  }

  @Get(':id')
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.plansService.getById(ctx, id);
  }

  @Patch(':id')
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePlanDto,
  ) {
    return this.plansService.update(ctx, id, dto);
  }

  @Delete(':id')
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.plansService.remove(ctx, id);
  }
}
