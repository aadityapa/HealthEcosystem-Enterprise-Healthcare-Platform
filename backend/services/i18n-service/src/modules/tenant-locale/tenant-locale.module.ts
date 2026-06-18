import { Module } from '@nestjs/common';
import { TenantLocaleController } from './tenant-locale.controller';
import { TenantLocaleService } from './tenant-locale.service';

@Module({
  controllers: [TenantLocaleController],
  providers: [TenantLocaleService],
})
export class TenantLocaleModule {}
