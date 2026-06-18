import { Module } from '@nestjs/common';
import { SiemController } from './siem.controller';
import { SiemService } from './siem.service';

@Module({
  controllers: [SiemController],
  providers: [SiemService],
})
export class SiemModule {}
