import { Controller, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ServiceContext } from '@/common/decorators/context.decorator';
import type { ServiceRequestContext } from '@/common/context/request-context';
import { OcrService } from './ocr.service';

@ApiTags('DMS OCR')
@Controller('api/v1/dms/documents/:id/ocr')
export class OcrController {
  constructor(private readonly ocrService: OcrService) {}

  @Post()
  @ApiOperation({ summary: 'Run OCR stub and store extracted text' })
  extract(
    @ServiceContext() ctx: ServiceRequestContext,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ocrService.extractText(ctx, id);
  }
}
