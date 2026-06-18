import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { WafService } from './waf.service';
import { BlockIpDto } from './dto/waf.dto';

@ApiTags('Security WAF')
@Controller('api/v1/security/waf')
export class WafController {
  constructor(private readonly wafService: WafService) {}

  @Get('status')
  @ApiOperation({ summary: 'Get WAF status and rules (stub)' })
  getStatus() {
    return this.wafService.getStatus();
  }

  @Post('block')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Block an IP address via WAF' })
  blockIp(@Body() dto: BlockIpDto) {
    return this.wafService.blockIp(dto.ip, dto.reason, dto.ttlMinutes);
  }
}
