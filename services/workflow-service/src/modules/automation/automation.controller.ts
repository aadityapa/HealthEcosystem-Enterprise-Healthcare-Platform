import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '@health/validation';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { AutomationService } from './automation.service';
import {
  CreateAutomationRuleDto,
  ListAutomationQueryDto,
  UpdateAutomationRuleDto,
} from './dto/automation.dto';

@ApiTags('Workflow Automation')
@Controller('api/v1/workflow/automation')
export class AutomationController {
  constructor(private readonly automationService: AutomationService) {}

  @Post()
  @ApiOperation({ summary: 'Create automation trigger rule' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateAutomationRuleDto,
  ) {
    return this.automationService.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List automation rules' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListAutomationQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.automationService.list(ctx, filters, pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get automation rule by ID' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.automationService.getById(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update automation rule' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAutomationRuleDto,
  ) {
    return this.automationService.update(ctx, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate automation rule' })
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.automationService.remove(ctx, id);
  }
}
