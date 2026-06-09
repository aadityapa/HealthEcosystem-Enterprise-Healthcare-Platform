import {
  Body,
  Controller,
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
import { LeadsService } from './leads.service';
import {
  CreateSalesLeadDto,
  ListSalesLeadsQueryDto,
  LogSalesActivityDto,
  UpdateSalesLeadDto,
} from './dto/leads.dto';

@ApiTags('CRM Leads')
@Controller('api/v1/crm/leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Get()
  @ApiOperation({ summary: 'List sales leads' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() query: ListSalesLeadsQueryDto,
  ) {
    return this.leadsService.listLeads(ctx, query);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create sales lead' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateSalesLeadDto,
  ) {
    return this.leadsService.createLead(ctx, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get sales lead with activities' })
  getById(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.leadsService.getLead(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update sales lead' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSalesLeadDto,
  ) {
    return this.leadsService.updateLead(ctx, id, dto);
  }

  @Post(':id/activities')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Log sales activity on lead' })
  logActivity(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: LogSalesActivityDto,
  ) {
    return this.leadsService.logActivity(ctx, id, dto);
  }
}
