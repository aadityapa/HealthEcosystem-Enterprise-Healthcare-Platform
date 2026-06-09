import { Body, Controller, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { MobileService } from './mobile.service';
import { UpdateMobileConfigDto } from './dto/mobile.dto';

@ApiTags('Branding - Mobile')
@Controller('api/v1/branding/mobile')
export class MobileController {
  constructor(private readonly mobileService: MobileService) {}

  @Get(':tenantId')
  @ApiOperation({ summary: 'Get mobile app configuration' })
  getConfig(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
  ) {
    return this.mobileService.getConfig(ctx, tenantId);
  }

  @Put(':tenantId')
  @ApiOperation({ summary: 'Update mobile app configuration' })
  updateConfig(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: UpdateMobileConfigDto,
  ) {
    return this.mobileService.updateConfig(ctx, tenantId, dto);
  }
}
