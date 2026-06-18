import { Module } from '@nestjs/common';
import { DocumentsModule } from '@/modules/documents/documents.module';
import { VersionsController } from './versions.controller';
import { VersionsService } from './versions.service';

@Module({
  imports: [DocumentsModule],
  controllers: [VersionsController],
  providers: [VersionsService],
  exports: [VersionsService],
})
export class VersionsModule {}
