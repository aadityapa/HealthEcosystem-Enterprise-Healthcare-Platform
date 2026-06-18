import type { MasterRequestContext } from '@/common/context/master-context';
import type { CreateRateCardDto, UpdateRateCardDto } from '../dto/rate-cards.dto';

export class CreateRateCardCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly dto: CreateRateCardDto,
  ) {}
}

export class UpdateRateCardCommand {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly rateCardId: string,
    public readonly dto: UpdateRateCardDto,
  ) {}
}

export class GetRateCardQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly rateCardId: string,
  ) {}
}

export class ListRateCardsQuery {
  constructor(
    public readonly ctx: MasterRequestContext,
    public readonly filters: {
      clientType?: string;
      isActive?: boolean;
      page?: number;
      limit?: number;
    },
  ) {}
}
