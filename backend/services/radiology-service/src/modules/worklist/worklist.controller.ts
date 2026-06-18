import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { WorklistService } from './worklist.service';

@ApiTags('Radiology Worklist')
@Controller('api/v1/radiology/worklist')
export class WorklistController {
  constructor(private readonly worklistService: WorklistService) {}

  @Get()
  @ApiOperation({ summary: 'RIS modality worklist' })
  getWorklist(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() pagination: PaginationDto,
  ) {
    return this.worklistService.getWorklist(ctx, pagination.page, pagination.limit);
  }
}
