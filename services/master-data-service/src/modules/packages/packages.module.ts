import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PackagesController } from './packages.controller';
import { PackagesService } from './packages.service';
import { PackagesHandlers } from './handlers/packages.handlers';

@Module({
  imports: [CqrsModule],
  controllers: [PackagesController],
  providers: [PackagesService, ...PackagesHandlers],
  exports: [PackagesService],
})
export class PackagesModule {}
