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
import { TicketStatus } from '@health/db';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { TicketsService } from './tickets.service';
import { CreateTicketDto, UpdateTicketDto } from './dto/tickets.dto';

@ApiTags('Customer Success Tickets')
@Controller('api/v1/customer-success/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateTicketDto) {
    return this.ticketsService.create(ctx, dto);
  }

  @Get()
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() pagination: PaginationDto,
    @Query('status') status?: TicketStatus,
  ) {
    return this.ticketsService.list(ctx, pagination.page, pagination.limit, status);
  }

  @Get(':id')
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.getById(ctx, id);
  }

  @Patch(':id')
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(ctx, id, dto);
  }

  @Delete(':id')
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.ticketsService.remove(ctx, id);
  }
}
