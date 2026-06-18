import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { LimsContext } from '@/common/decorators/lims.decorators';
import type { LimsRequestContext } from '@/common/context/lims-context';
import {
  CollectSampleDto,
  ReceiveSampleDto,
  ProcessSampleDto,
  RejectSampleDto,
  ListSamplesQueryDto,
} from './dto/samples.dto';
import {
  CollectSampleCommand,
  ReceiveSampleCommand,
  ProcessSampleCommand,
  RejectSampleCommand,
  GetSampleQuery,
  GetSampleByBarcodeQuery,
  ListSamplesQuery,
  GetSampleEventsQuery,
} from './commands/samples.commands';

@ApiTags('Samples')
@Controller('api/v1/lims/samples')
export class SamplesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List samples' })
  listSamples(
    @LimsContext() ctx: LimsRequestContext,
    @Query() filters: ListSamplesQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListSamplesQuery(ctx, { ...filters, page: pagination.page, limit: pagination.limit }),
    );
  }

  @Get('barcode/:barcode')
  @ApiOperation({ summary: 'Lookup sample by barcode' })
  getByBarcode(
    @LimsContext() ctx: LimsRequestContext,
    @Param('barcode') barcode: string,
  ) {
    return this.queryBus.execute(new GetSampleByBarcodeQuery(ctx, barcode));
  }

  @Get(':id/events')
  @ApiOperation({ summary: 'Get sample event log' })
  getEvents(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetSampleEventsQuery(ctx, id));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sample detail' })
  getSample(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.queryBus.execute(new GetSampleQuery(ctx, id));
  }

  @Patch(':id/collect')
  @ApiOperation({ summary: 'Mark sample collected' })
  collect(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CollectSampleDto,
  ) {
    return this.commandBus.execute(new CollectSampleCommand(ctx, id, dto));
  }

  @Patch(':id/receive')
  @ApiOperation({ summary: 'Mark sample received' })
  receive(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReceiveSampleDto,
  ) {
    return this.commandBus.execute(new ReceiveSampleCommand(ctx, id, dto));
  }

  @Patch(':id/process')
  @ApiOperation({ summary: 'Mark sample processing' })
  process(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ProcessSampleDto,
  ) {
    return this.commandBus.execute(new ProcessSampleCommand(ctx, id, dto));
  }

  @Patch(':id/reject')
  @ApiOperation({ summary: 'Reject sample' })
  reject(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RejectSampleDto,
  ) {
    return this.commandBus.execute(new RejectSampleCommand(ctx, id, dto));
  }
}
