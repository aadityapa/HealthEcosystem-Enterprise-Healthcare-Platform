import { Global, Module } from '@nestjs/common';
import { DicomParserService } from './dicom-parser.service';

@Global()
@Module({
  providers: [DicomParserService],
  exports: [DicomParserService],
})
export class RadiologyServicesModule {}
