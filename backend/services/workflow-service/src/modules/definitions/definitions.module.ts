import { Module } from '@nestjs/common';
import { DefinitionsController } from './definitions.controller';
import { DefinitionsService } from './definitions.service';

@Module({
  controllers: [DefinitionsController],
  providers: [DefinitionsService],
  exports: [DefinitionsService],
})
export class DefinitionsModule {}
