import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AgentType } from '@/common/agent-type';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { AgentOrchestratorService } from '@/services/agent-orchestrator.service';
import { AgentChatDto } from '../agents/dto/agents.dto';

@ApiTags('Doctor Agent')
@Controller('api/v1/agents/doctor')
export class DoctorAgentController {
  constructor(private readonly orchestrator: AgentOrchestratorService) {}

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Doctor agent chat — clinical summaries, prescriptions' })
  chat(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: AgentChatDto) {
    return this.orchestrator.invoke(ctx, AgentType.DOCTOR, dto);
  }
}
