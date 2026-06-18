import { Module } from '@nestjs/common';
import { TestsController } from './tests.controller';
import { TestsAnalyticsService } from './tests.service';

@Module({
  controllers: [TestsController],
  providers: [TestsAnalyticsService],
})
export class TestsModule {}
