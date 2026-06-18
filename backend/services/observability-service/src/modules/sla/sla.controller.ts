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
import { SlaService } from './sla.service';
import {
  CreateSlaDto,
  ListErrorBudgetsQueryDto,
  ListSlaQueryDto,
  UpdateSlaDto,
} from './dto/sla.dto';

@ApiTags('Observability SLA')
@Controller('api/v1/observability/sla')
export class SlaController {
  constructor(private readonly slaService: SlaService) {}

  @Get()
  @ApiOperation({ summary: 'List SLA definitions' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: ListSlaQueryDto,
  ) {
    return this.slaService.list(ctx, query);
  }

  @Get('error-budgets')
  @ApiOperation({ summary: 'List error budgets' })
  listErrorBudgets(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: ListErrorBudgetsQueryDto,
  ) {
    return this.slaService.listErrorBudgets(ctx, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get SLA definition by ID' })
  getById(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.slaService.getById(ctx, id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create SLA definition' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateSlaDto,
  ) {
    return this.slaService.create(ctx, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update SLA definition' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSlaDto,
  ) {
    return this.slaService.update(ctx, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete SLA definition' })
  remove(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.slaService.remove(ctx, id);
  }
}
