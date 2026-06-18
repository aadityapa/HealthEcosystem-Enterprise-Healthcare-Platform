import { Body, Controller, Get, Param, ParseUUIDPipe, Put } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { ThemesService } from './themes.service';
import { UpdateThemeDto } from './dto/themes.dto';

@ApiTags('Branding - Themes')
@Controller('api/v1/branding/themes')
export class ThemesController {
  constructor(private readonly themesService: ThemesService) {}

  @Get(':tenantId')
  @ApiOperation({ summary: 'Get tenant theme configuration' })
  getTheme(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
  ) {
    return this.themesService.getTheme(ctx, tenantId);
  }

  @Put(':tenantId')
  @ApiOperation({ summary: 'Update tenant theme configuration' })
  updateTheme(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('tenantId', ParseUUIDPipe) tenantId: string,
    @Body() dto: UpdateThemeDto,
  ) {
    return this.themesService.updateTheme(ctx, tenantId, dto);
  }
}
