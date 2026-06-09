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
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { PhlebotomistsService } from './phlebotomists.service';
import {
  CreatePhlebotomistDto,
  ListPhlebotomistsDto,
  UpdatePhlebotomistDto,
} from './dto/phlebotomists.dto';

@ApiTags('Phlebotomists')
@Controller('api/v1/field/phlebotomists')
export class PhlebotomistsController {
  constructor(private readonly phlebotomistsService: PhlebotomistsService) {}

  @Get()
  @ApiOperation({ summary: 'List phlebotomists' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: ListPhlebotomistsDto) {
    return this.phlebotomistsService.list(ctx, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create phlebotomist' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreatePhlebotomistDto) {
    return this.phlebotomistsService.create(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get phlebotomist by ID' })
  get(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.phlebotomistsService.get(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update phlebotomist' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePhlebotomistDto,
  ) {
    return this.phlebotomistsService.update(ctx, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate phlebotomist' })
  remove(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.phlebotomistsService.remove(ctx, id);
  }
}
