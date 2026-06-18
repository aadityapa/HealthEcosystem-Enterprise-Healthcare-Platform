import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { RateCardsController } from './rate-cards.controller';
import { RateCardsService } from './rate-cards.service';
import { RateCardsHandlers } from './handlers/rate-cards.handlers';

@Module({
  imports: [CqrsModule],
  controllers: [RateCardsController],
  providers: [RateCardsService, ...RateCardsHandlers],
})
export class RateCardsModule {}
