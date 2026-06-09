import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { RetentionService } from './retention.service';
import { ExpiringQueryDto, LegalHoldDto } from './dto/retention.dto';

@ApiTags('DMS Retention')
@Controller('api/v1/dms/retention')
export class RetentionController {
  constructor(private readonly retentionService: RetentionService) {}

  @Get('expiring')
  @ApiOperation({ summary: 'List documents approaching retention expiry' })
  expiring(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: ExpiringQueryDto,
  ) {
    return this.retentionService.getExpiring(ctx, query.withinDays ?? 30);
  }

  @Post('legal-hold')
  @ApiOperation({ summary: 'Apply or release legal hold on a document' })
  legalHold(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: LegalHoldDto) {
    return this.retentionService.setLegalHold(ctx, dto.documentId, dto.legalHold);
  }
}
