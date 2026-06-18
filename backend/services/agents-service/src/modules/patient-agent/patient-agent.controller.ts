import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgentType } from '@/common/agent-type';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { AgentOrchestratorService } from '@/services/agent-orchestrator.service';
import { AgentChatDto } from '../agents/dto/agents.dto';

@ApiTags('Patient Agent')
@Controller('api/v1/agents/patient')
export class PatientAgentController {
  constructor(private readonly orchestrator: AgentOrchestratorService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Patient agent chat — report explanation, booking, follow-up' })
  chat(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: AgentChatDto) {
    return this.orchestrator.invoke(ctx, AgentType.PATIENT, dto);
  }
}
