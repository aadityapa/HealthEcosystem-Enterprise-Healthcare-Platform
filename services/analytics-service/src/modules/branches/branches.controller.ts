import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { DateRangeQueryDto } from '@/common/dto/analytics-query.dto';
import { BranchesService } from './branches.service';

@ApiTags('Analytics Branches')
@Controller('api/v1/analytics/branches')
export class BranchesController {
  constructor(private readonly branchesService: BranchesService) {}

  @Get()
  @ApiOperation({ summary: 'Branch comparison metrics' })
  compare(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: DateRangeQueryDto,
  ) {
    return this.branchesService.compareBranches(ctx, query);
  }
}
