import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { VoiceService } from './voice.service';
import { TranscribeDto, VoiceRespondDto } from './dto/voice.dto';

@ApiTags('AI Voice')
@Controller('api/v1/ai/voice')
export class VoiceController {
  constructor(private readonly voiceService: VoiceService) {}

  @Post('transcribe')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Transcribe voice audio (stub)' })
  transcribe(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: TranscribeDto,
  ) {
    return this.voiceService.transcribe(ctx, dto);
  }

  @Post('respond')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate voice assistant response from transcript' })
  respond(
    @ServiceContext() ctx: ServiceRequestContext,
    @Body() dto: VoiceRespondDto,
  ) {
    return this.voiceService.respond(ctx, dto);
  }
}
