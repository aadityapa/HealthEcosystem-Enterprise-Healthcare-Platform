import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { EvidenceService } from './evidence.service';
import { CreateEvidenceDto, UpdateEvidenceDto } from './dto/evidence.dto';

@ApiTags('Compliance Evidence')
@Controller('api/v1/compliance/evidence')
export class EvidenceController {
  constructor(private readonly evidenceService: EvidenceService) {}

  @Get()
  @ApiOperation({ summary: 'List audit evidence' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: PaginationDto) {
    return this.evidenceService.list(ctx, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get evidence by id' })
  getById(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.evidenceService.getById(ctx, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create audit evidence' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateEvidenceDto,
  ) {
    return this.evidenceService.create(ctx, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update audit evidence' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEvidenceDto,
  ) {
    return this.evidenceService.update(ctx, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete audit evidence' })
  remove(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.evidenceService.remove(ctx, id);
  }
}
