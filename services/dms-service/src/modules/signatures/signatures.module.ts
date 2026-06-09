import { Module } from '@nestjs/common';
import { DocumentsModule } from '@/modules/documents/documents.module';
import { SignaturesController } from './signatures.controller';
import { SignaturesService } from './signatures.service';

@Module({
  imports: [DocumentsModule],
  controllers: [SignaturesController],
  providers: [SignaturesService],
  exports: [SignaturesService],
})
export class SignaturesModule {}
