import { Module } from '@nestjs/common';
import { DocumentsModule } from '@/modules/documents/documents.module';
import { OcrController } from './ocr.controller';
import { OcrService } from './ocr.service';

@Module({
  imports: [DocumentsModule],
  controllers: [OcrController],
  providers: [OcrService],
  exports: [OcrService],
})
export class OcrModule {}
