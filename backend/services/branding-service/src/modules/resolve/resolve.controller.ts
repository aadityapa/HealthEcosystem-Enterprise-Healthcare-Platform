import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ResolveService } from './resolve.service';

@ApiTags('Branding - Resolve')
@Controller('api/v1/branding/resolve')
export class ResolveController {
  constructor(private readonly resolveService: ResolveService) {}

  @Get()
  @ApiOperation({ summary: 'Resolve brand by custom domain (public)' })
  @ApiQuery({ name: 'domain', required: true })
  resolve(@Query('domain') domain: string) {
    return this.resolveService.resolveByDomain(domain);
  }
}
