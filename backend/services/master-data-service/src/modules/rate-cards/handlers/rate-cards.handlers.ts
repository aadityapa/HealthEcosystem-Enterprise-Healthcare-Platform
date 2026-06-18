import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CreateRateCardCommand,
  UpdateRateCardCommand,
  GetRateCardQuery,
  ListRateCardsQuery,
} from '../commands/rate-cards.commands';
import { RateCardsService } from '../rate-cards.service';

@CommandHandler(CreateRateCardCommand)
export class CreateRateCardHandler implements ICommandHandler<CreateRateCardCommand> {
  constructor(private readonly service: RateCardsService) {}
  execute(cmd: CreateRateCardCommand) {
    return this.service.create(cmd.ctx, cmd.dto);
  }
}

@CommandHandler(UpdateRateCardCommand)
export class UpdateRateCardHandler implements ICommandHandler<UpdateRateCardCommand> {
  constructor(private readonly service: RateCardsService) {}
  execute(cmd: UpdateRateCardCommand) {
    return this.service.update(cmd.ctx, cmd.rateCardId, cmd.dto);
  }
}

@QueryHandler(GetRateCardQuery)
export class GetRateCardHandler implements IQueryHandler<GetRateCardQuery> {
  constructor(private readonly service: RateCardsService) {}
  execute(query: GetRateCardQuery) {
    return this.service.get(query.ctx, query.rateCardId);
  }
}

@QueryHandler(ListRateCardsQuery)
export class ListRateCardsHandler implements IQueryHandler<ListRateCardsQuery> {
  constructor(private readonly service: RateCardsService) {}
  execute(query: ListRateCardsQuery) {
    return this.service.list(query.ctx, query.filters);
  }
}

export const RateCardsHandlers = [
  CreateRateCardHandler,
  UpdateRateCardHandler,
  GetRateCardHandler,
  ListRateCardsHandler,
];
