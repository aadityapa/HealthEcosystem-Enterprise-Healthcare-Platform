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
import { DocumentsService } from './documents.service';
import {
  CreateDocumentDto,
  ListDocumentsQueryDto,
  UpdateDocumentDto,
  UploadDocumentDto,
} from './dto/documents.dto';

@ApiTags('DMS Documents')
@Controller('api/v1/dms/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create document record' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateDocumentDto) {
    return this.documentsService.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List documents' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListDocumentsQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.documentsService.list(ctx, filters, pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.documentsService.getById(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document metadata' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(ctx, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete document' })
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.documentsService.remove(ctx, id);
  }

  @Post(':id/upload')
  @ApiOperation({ summary: 'Upload document file (storage key stub)' })
  upload(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UploadDocumentDto,
  ) {
    return this.documentsService.upload(ctx, id, dto);
  }
}
