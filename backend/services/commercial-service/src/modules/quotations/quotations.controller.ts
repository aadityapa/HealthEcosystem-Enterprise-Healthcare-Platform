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
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto, UpdateQuotationDto } from './dto/quotations.dto';

@ApiTags('Commercial Quotations')
@Controller('api/v1/commercial/quotations')
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateQuotationDto) {
    return this.quotationsService.create(ctx, dto);
  }

  @Get()
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() pagination: PaginationDto,
    @Query('status') status?: string,
  ) {
    return this.quotationsService.list(ctx, pagination.page, pagination.limit, status);
  }

  @Get(':id')
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.quotationsService.getById(ctx, id);
  }

  @Patch(':id')
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateQuotationDto,
  ) {
    return this.quotationsService.update(ctx, id, dto);
  }

  @Delete(':id')
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.quotationsService.remove(ctx, id);
  }
}
