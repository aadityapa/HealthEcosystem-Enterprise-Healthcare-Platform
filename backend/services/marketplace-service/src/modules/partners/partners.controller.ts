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
import { PartnersService } from './partners.service';
import { CreatePartnerDto, UpdatePartnerDto } from './dto/partners.dto';

@ApiTags('Marketplace Partners')
@Controller('api/v1/marketplace/partners')
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Post()
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreatePartnerDto) {
    return this.partnersService.create(ctx, dto);
  }

  @Get()
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() pagination: PaginationDto) {
    return this.partnersService.list(ctx, pagination.page, pagination.limit);
  }

  @Get(':id')
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.partnersService.getById(ctx, id);
  }

  @Patch(':id')
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartnerDto,
  ) {
    return this.partnersService.update(ctx, id, dto);
  }

  @Delete(':id')
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.partnersService.remove(ctx, id);
  }
}
