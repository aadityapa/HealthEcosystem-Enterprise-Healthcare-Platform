import { Module } from '@nestjs/common';
import { TranslationsController } from './translations.controller';
import { TranslationsService } from './translations.service';

@Module({
  controllers: [TranslationsController],
  providers: [TranslationsService],
})
export class TranslationsModule {}
