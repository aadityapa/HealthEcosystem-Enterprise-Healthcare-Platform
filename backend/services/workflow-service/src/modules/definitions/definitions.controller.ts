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
import { DefinitionsService } from './definitions.service';
import {
  CreateWorkflowDefinitionDto,
  ListDefinitionsQueryDto,
  UpdateWorkflowDefinitionDto,
} from './dto/definitions.dto';

@ApiTags('Workflow Definitions')
@Controller('api/v1/workflow/definitions')
export class DefinitionsController {
  constructor(private readonly definitionsService: DefinitionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create workflow definition with optional BPMN XML' })
  create(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateWorkflowDefinitionDto,
  ) {
    return this.definitionsService.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List workflow definitions' })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query() filters: ListDefinitionsQueryDto,
    @Query() pagination: PaginationDto,
  ) {
    return this.definitionsService.list(ctx, filters, pagination.page, pagination.limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get workflow definition by ID' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.definitionsService.getById(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update workflow definition' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateWorkflowDefinitionDto,
  ) {
    return this.definitionsService.update(ctx, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Deactivate workflow definition' })
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.definitionsService.remove(ctx, id);
  }
}
