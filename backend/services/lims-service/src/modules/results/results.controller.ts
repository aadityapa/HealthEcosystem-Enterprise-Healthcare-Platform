import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { LimsContext } from '@/common/decorators/lims.decorators';
import type { LimsRequestContext } from '@/common/context/lims-context';
import {
  EnterResultsDto,
  VerifyResultDto,
  ApproveResultDto,
  ListPendingResultsQueryDto,
} from './dto/results.dto';
import {
  EnterResultsCommand,
  VerifyResultCommand,
  ApproveResultCommand,
  ListPendingResultsQuery,
  GetSampleResultsQuery,
} from './commands/results.commands';

@ApiTags('Results')
@Controller('api/v1/lims')
export class ResultsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post('samples/:id/results')
  @ApiOperation({ summary: 'Enter results for a sample' })
  enterResults(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) sampleId: string,
    @Body() dto: EnterResultsDto,
  ) {
    return this.commandBus.execute(new EnterResultsCommand(ctx, sampleId, dto));
  }

  @Get('samples/:id/results')
  @ApiOperation({ summary: 'Get results for a sample' })
  getSampleResults(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) sampleId: string,
  ) {
    return this.queryBus.execute(new GetSampleResultsQuery(ctx, sampleId));
  }

  @Get('results/pending')
  @ApiOperation({ summary: 'Pending verification queue' })
  listPending(
    @LimsContext() ctx: LimsRequestContext,
    @Query() filters: ListPendingResultsQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.queryBus.execute(
      new ListPendingResultsQuery(ctx, {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      }),
    );
  }

  @Patch('results/:id/verify')
  @ApiOperation({ summary: 'Verify a result' })
  verify(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) resultId: string,
    @Body() dto: VerifyResultDto,
  ) {
    return this.commandBus.execute(new VerifyResultCommand(ctx, resultId, dto));
  }

  @Patch('results/:id/approve')
  @ApiOperation({ summary: 'Approve a result' })
  approve(
    @LimsContext() ctx: LimsRequestContext,
    @Param('id', ParseUUIDPipe) resultId: string,
    @Body() dto: ApproveResultDto,
  ) {
    return this.commandBus.execute(new ApproveResultCommand(ctx, resultId, dto));
  }
}
