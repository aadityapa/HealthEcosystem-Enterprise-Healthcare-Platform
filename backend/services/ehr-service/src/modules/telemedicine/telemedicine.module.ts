import { Module } from '@nestjs/common';
import { TelemedicineController } from './telemedicine.controller';
import { TelemedicineService } from './telemedicine.service';

@Module({
  controllers: [TelemedicineController],
  providers: [TelemedicineService],
  exports: [TelemedicineService],
})
export class TelemedicineModule {}
