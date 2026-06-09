import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { TaxRulesService } from './tax-rules.service';

@ApiTags('I18n - Tax Rules')
@Controller('api/v1/i18n/tax-rules')
export class TaxRulesController {
  constructor(private readonly taxRulesService: TaxRulesService) {}

  @Get(':countryCode')
  @ApiOperation({ summary: 'Get tax rules for a country' })
  get(@Param('countryCode') countryCode: string) {
    return this.taxRulesService.getByCountryCode(countryCode);
  }
}
