import { Module } from '@nestjs/common';
import { AbhaController } from './abha.controller';
import { AbhaService } from './abha.service';

@Module({
  controllers: [AbhaController],
  providers: [AbhaService],
  exports: [AbhaService],
})
export class AbhaModule {}
