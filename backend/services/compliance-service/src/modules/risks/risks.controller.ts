import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { PaginationDto } from '@/common/dto/pagination.dto';
import { RisksService } from './risks.service';
import { CreateRiskDto, UpdateRiskDto } from './dto/risks.dto';

@ApiTags('Compliance Risks')
@Controller('api/v1/compliance/risks')
export class RisksController {
  constructor(private readonly risksService: RisksService) {}

  @Get()
  @ApiOperation({ summary: 'List risk register entries' })
  list(@ServiceContext() ctx: ServiceRequestContext, @Query() query: PaginationDto) {
    return this.risksService.list(ctx, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get risk by id' })
  getById(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.risksService.getById(ctx, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create risk register entry' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateRiskDto,
  ) {
    return this.risksService.create(ctx, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update risk register entry' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRiskDto,
  ) {
    return this.risksService.update(ctx, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete risk register entry' })
  remove(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.risksService.remove(ctx, id);
  }
}
