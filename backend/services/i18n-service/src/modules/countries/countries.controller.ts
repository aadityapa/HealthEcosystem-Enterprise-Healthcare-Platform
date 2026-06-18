import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CountriesService } from './countries.service';

@ApiTags('I18n - Countries')
@Controller('api/v1/i18n/countries')
export class CountriesController {
  constructor(private readonly countriesService: CountriesService) {}

  @Get()
  @ApiOperation({ summary: 'List country packs (IN, AE, SA, SG, GB)' })
  list() {
    return this.countriesService.list();
  }
}
