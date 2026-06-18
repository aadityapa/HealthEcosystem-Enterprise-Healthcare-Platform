import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TestsController } from './tests.controller';
import { TestsService } from './tests.service';
import { TestsHandlers } from './handlers/tests.handlers';

@Module({
  imports: [CqrsModule],
  controllers: [TestsController],
  providers: [TestsService, ...TestsHandlers],
  exports: [TestsService],
})
export class TestsModule {}
