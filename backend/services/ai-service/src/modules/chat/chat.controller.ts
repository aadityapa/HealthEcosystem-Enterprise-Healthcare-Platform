import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ChatService } from './chat.service';
import { CreateChatSessionDto, SendChatMessageDto } from './dto/chat.dto';

@ApiTags('AI Chat')
@Controller('api/v1/ai/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new AI chat session' })
  createSession(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: CreateChatSessionDto,
  ) {
    return this.chatService.createSession(ctx, dto);
  }

  @Post(':sessionId/messages')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Send a message and receive AI assistant reply' })
  sendMessage(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('sessionId', ParseUUIDPipe) sessionId: string,
    @Body() dto: SendChatMessageDto,
  ) {
    return this.chatService.sendMessage(ctx, sessionId, dto);
  }
}
