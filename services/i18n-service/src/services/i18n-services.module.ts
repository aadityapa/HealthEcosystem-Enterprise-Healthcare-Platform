import { Module } from '@nestjs/common';
import { CountryPackSeedService } from './country-pack-seed.service';

@Module({
  providers: [CountryPackSeedService],
  exports: [CountryPackSeedService],
})
export class I18nServicesModule {}
