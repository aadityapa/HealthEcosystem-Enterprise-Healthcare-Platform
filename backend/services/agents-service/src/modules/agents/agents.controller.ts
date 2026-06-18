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
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AgentType, type AgentTypeValue } from '@/common/agent-type';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { AgentsService } from './agents.service';
import { CreateAgentDto, UpdateAgentDto } from './dto/agents.dto';

@ApiTags('Agents')
@Controller('api/v1/agents/agents')
export class AgentsController {
  constructor(private readonly agentsService: AgentsService) {}

  @Post()
  @ApiOperation({ summary: 'Create AI agent' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateAgentDto) {
    return this.agentsService.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List AI agents' })
  @ApiQuery({ name: 'agentType', required: false, enum: Object.values(AgentType) })
  list(
    @ServiceContext() ctx: ServiceRequestContext,
    @Query('agentType') agentType?: AgentTypeValue,
  ) {
    return this.agentsService.list(ctx, agentType);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get AI agent' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.agentsService.getById(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update AI agent' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAgentDto,
  ) {
    return this.agentsService.update(ctx, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete AI agent' })
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.agentsService.remove(ctx, id);
  }
}
