import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgentType } from '@/common/agent-type';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { AgentOrchestratorService } from '@/services/agent-orchestrator.service';
import { AgentChatDto } from '../agents/dto/agents.dto';

@ApiTags('Lab Agent')
@Controller('api/v1/agents/lab')
export class LabAgentController {
  constructor(private readonly orchestrator: AgentOrchestratorService) {}

  @Post('analyze')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Lab agent analyze — QC analysis, device monitoring' })
  analyze(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: AgentChatDto) {
    return this.orchestrator.invoke(ctx, AgentType.LAB, dto);
  }
}
