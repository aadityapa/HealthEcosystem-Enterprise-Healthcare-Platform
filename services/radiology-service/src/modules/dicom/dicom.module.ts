import { Module } from '@nestjs/common';
import { DicomController } from './dicom.controller';
import { DicomService } from './dicom.service';

@Module({
  controllers: [DicomController],
  providers: [DicomService],
  exports: [DicomService],
})
export class DicomModule {}
