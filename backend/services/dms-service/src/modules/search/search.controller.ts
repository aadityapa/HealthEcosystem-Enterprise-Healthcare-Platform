import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { SearchService } from './search.service';

@ApiTags('DMS Search')
@Controller('api/v1/dms/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Full-text search on title and OCR text' })
  search(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query('q') q: string,
    @Query() pagination: PaginationDto,
  ) {
    return this.searchService.search(ctx, q, pagination.page, pagination.limit);
  }
}
