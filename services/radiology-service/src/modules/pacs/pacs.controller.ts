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
import { PacsService } from './pacs.service';
import { CreatePacsNodeDto, UpdatePacsNodeDto } from './dto/pacs.dto';

@ApiTags('Radiology PACS')
@Controller('api/v1/radiology/pacs')
export class PacsController {
  constructor(private readonly pacsService: PacsService) {}

  @Post()
  @ApiOperation({ summary: 'Register PACS node' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreatePacsNodeDto) {
    return this.pacsService.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List PACS nodes' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() pagination: PaginationDto) {
    return this.pacsService.list(ctx, pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PACS node' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.pacsService.getById(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update PACS node' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePacsNodeDto,
  ) {
    return this.pacsService.update(ctx, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete PACS node' })
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.pacsService.remove(ctx, id);
  }
}
