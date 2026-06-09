import { Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from '@health/validation';
import { MessageParseStatus } from '@health/db';
import { DeviceContext } from '@/common/decorators/device.decorators';
import type { DeviceRequestContext } from '@/common/context/device-context';
import { MessagesService } from './messages.service';

class ListMessagesQueryDto {
  @IsOptional()
  @IsUUID()
  deviceId?: string;

  @IsOptional()
  @IsEnum(MessageParseStatus)
  parseStatus?: MessageParseStatus;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;
}

@ApiTags('Device Messages')
@Controller('api/v1/devices/messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get()
  @ApiOperation({ summary: 'List device messages' })
  list(
    @DeviceContext() ctx: DeviceRequestContext,
    @Query() query: ListMessagesQueryDto,
  ) {
    return this.messagesService.listMessages(ctx, query);
  }

  @Get('failed')
  @ApiOperation({ summary: 'List failed messages' })
  listFailed(
    @DeviceContext() ctx: DeviceRequestContext,
    @Query() query: ListMessagesQueryDto,
  ) {
    return this.messagesService.listFailedMessages(ctx, query);
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry failed message processing' })
  retry(
    @DeviceContext() ctx: DeviceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.messagesService.retryMessage(ctx, id);
  }
}
