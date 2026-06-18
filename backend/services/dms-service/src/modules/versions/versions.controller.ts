import { Body, Controller, Get, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { VersionsService } from './versions.service';
import { CreateVersionDto } from './dto/versions.dto';

@ApiTags('DMS Versions')
@Controller('api/v1/dms/documents/:id/versions')
export class VersionsController {
  constructor(private readonly versionsService: VersionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create new document version' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateVersionDto,
  ) {
    return this.versionsService.createVersion(ctx, id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List document versions' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.versionsService.listVersions(ctx, id);
  }
}
