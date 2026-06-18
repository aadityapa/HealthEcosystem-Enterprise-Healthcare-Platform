import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { TenantLocaleService } from './tenant-locale.service';
import { CreateTenantLocaleDto, UpdateTenantLocaleDto } from './dto/tenant-locale.dto';

@ApiTags('I18n - Tenant Locale')
@Controller('api/v1/i18n/tenant-locale')
export class TenantLocaleController {
  constructor(private readonly tenantLocaleService: TenantLocaleService) {}

  @Post()
  @ApiOperation({ summary: 'Create tenant locale configuration' })
  create(@ServiceContext() ctx: ServiceRequestContext, @Body() dto: CreateTenantLocaleDto) {
    return this.tenantLocaleService.create(ctx, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List tenant locale configurations' })
  list(@ServiceContext() ctx: ServiceRequestContext) {
    return this.tenantLocaleService.list(ctx);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get tenant locale configuration' })
  get(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.tenantLocaleService.getById(ctx, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update tenant locale configuration' })
  update(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenantLocaleDto,
  ) {
    return this.tenantLocaleService.update(ctx, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete tenant locale configuration' })
  remove(@ServiceContext() ctx: ServiceRequestContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.tenantLocaleService.remove(ctx, id);
  }
}
