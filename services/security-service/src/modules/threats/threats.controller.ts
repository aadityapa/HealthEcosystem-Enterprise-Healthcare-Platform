import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { ThreatsService } from './threats.service';
import { DetectThreatsDto } from './dto/threats.dto';

@ApiTags('Security Threats')
@Controller('api/v1/security/threats')
export class ThreatsController {
  constructor(private readonly threatsService: ThreatsService) {}

  @Get()
  @ApiOperation({ summary: 'List threat detections' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: PaginationDto) {
    return this.threatsService.list(ctx, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Run threat detection on events' })
  detect(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: DetectThreatsDto,
  ) {
    return this.threatsService.detect(ctx, dto);
  }

  @Post(':id/acknowledge')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Acknowledge a threat detection' })
  acknowledge(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.threatsService.acknowledge(ctx, id);
  }
}
