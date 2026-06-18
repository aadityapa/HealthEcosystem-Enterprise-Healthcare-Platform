import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { DeviceCatalogController } from './device-catalog.controller';
import { DeviceCatalogService } from './device-catalog.service';
import { DeviceCatalogHandlers } from './handlers/device-catalog.handlers';

@Module({
  imports: [CqrsModule],
  controllers: [DeviceCatalogController],
  providers: [DeviceCatalogService, ...DeviceCatalogHandlers],
})
export class DeviceCatalogModule {}
