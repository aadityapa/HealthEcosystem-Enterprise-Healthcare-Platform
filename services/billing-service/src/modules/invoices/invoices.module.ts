import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CoreServicesModule } from '@/services/core-services.module';
import { KafkaModule } from '@/kafka/kafka.module';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoiceHandlers } from './handlers/invoices.handlers';

@Module({
  imports: [CqrsModule, CoreServicesModule, KafkaModule],
  controllers: [InvoicesController],
  providers: [InvoicesService, ...InvoiceHandlers],
  exports: [InvoicesService],
})
export class InvoicesModule {}
