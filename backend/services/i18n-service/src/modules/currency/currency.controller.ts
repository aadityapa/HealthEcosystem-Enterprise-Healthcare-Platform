import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { ConvertCurrencyQueryDto } from './dto/currency.dto';

@ApiTags('I18n - Currency')
@Controller('api/v1/i18n/currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('convert')
  @ApiOperation({ summary: 'Convert currency (stub rates)' })
  convert(@Query() query: ConvertCurrencyQueryDto) {
    return this.currencyService.convert(query.amount, query.from, query.to);
  }
}
