import { Module } from '@nestjs/common';
import { AdapterRegistry } from './adapter.registry';

@Module({
  providers: [AdapterRegistry],
  exports: [AdapterRegistry],
})
export class AdaptersModule {}
