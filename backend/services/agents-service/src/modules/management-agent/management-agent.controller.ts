import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgentType } from '@/common/agent-type';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { AgentOrchestratorService } from '@/services/agent-orchestrator.service';
import { AgentChatDto } from '../agents/dto/agents.dto';

@ApiTags('Management Agent')
@Controller('api/v1/agents/management')
export class ManagementAgentController {
  constructor(private readonly orchestrator: AgentOrchestratorService) {}

  @Post('insights')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Management agent insights — revenue, operations' })
  insights(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: AgentChatDto) {
    return this.orchestrator.invoke(ctx, AgentType.MANAGEMENT, dto);
  }
}
