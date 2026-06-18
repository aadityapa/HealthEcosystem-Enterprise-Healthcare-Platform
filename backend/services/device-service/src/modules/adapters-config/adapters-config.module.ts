import { Module } from '@nestjs/common';
import { AdaptersConfigController } from './adapters-config.controller';
import { AdaptersConfigService } from './adapters-config.service';

@Module({
  controllers: [AdaptersConfigController],
  providers: [AdaptersConfigService],
  exports: [AdaptersConfigService],
})
export class AdaptersConfigModule {}
