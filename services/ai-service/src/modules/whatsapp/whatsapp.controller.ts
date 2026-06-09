import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppWebhookDto } from './dto/whatsapp.dto';

@ApiTags('AI WhatsApp')
@Controller('api/v1/ai/whatsapp')
export class WhatsAppController {
  constructor(private readonly whatsAppService: WhatsAppService) {}

  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Process inbound WhatsApp message webhook' })
  webhook(@Body() dto: WhatsAppWebhookDto) {
    return this.whatsAppService.handleWebhook(dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List WhatsApp sessions for tenant' })
  listSessions(@ServiceContext() ctx: ServiceRequestContext) {
    return this.whatsAppService.listSessions(ctx);
  }
}
