import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ExchangeService } from './exchange.service';
import {
  HiuCallbackDto,
  LinkHealthRecordDto,
  ListHealthRecordLinksQueryDto,
} from './dto/exchange.dto';

@ApiTags('ABDM Exchange')
@Controller('api/v1/abdm/exchange')
export class ExchangeController {
  constructor(private readonly exchangeService: ExchangeService) {}

  @Get('health-records')
  @ApiOperation({ summary: 'List health record links' })
  listHealthRecords(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() pagination: PaginationDto,
    @Query() filters: ListHealthRecordLinksQueryDto,
  ) {
    return this.exchangeService.listHealthRecordLinks(ctx, {
      ...filters,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Post('health-records/link')
  @ApiOperation({ summary: 'Link health record to ABHA care context' })
  linkHealthRecord(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: LinkHealthRecordDto,
  ) {
    return this.exchangeService.linkHealthRecord(ctx, dto);
  }

  @Get('health-records/:id')
  @ApiOperation({ summary: 'Get health record link by ID' })
  getHealthRecord(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.exchangeService.getHealthRecordLink(ctx, id);
  }

  @Post('webhook/hiu-callback')
  @ApiOperation({ summary: 'HIU callback stub' })
  hiuCallback(@Body() dto: HiuCallbackDto) {
    return this.exchangeService.hiuCallback(dto);
  }
}
