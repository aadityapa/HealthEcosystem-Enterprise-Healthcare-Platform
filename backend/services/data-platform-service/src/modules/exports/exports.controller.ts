import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ExportsService } from './exports.service';

@ApiTags('Data Exports')
@Controller('api/v1/data/exports')
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get('regulatory')
  @ApiOperation({ summary: 'Regulatory report export (stub)' })
  getRegulatory(
    @ServiceContext() _ctx: ServiceRequestContext,
  ) {
    return this.exportsService.getRegulatoryExport();
  }
}
