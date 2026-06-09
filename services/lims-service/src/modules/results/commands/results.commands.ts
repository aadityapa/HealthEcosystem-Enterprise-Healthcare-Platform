import type { LimsRequestContext } from '@/common/context/lims-context';
import type { EnterResultsDto, VerifyResultDto, ApproveResultDto } from '../dto/results.dto';

export class EnterResultsCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly sampleId: string,
    public readonly dto: EnterResultsDto,
  ) {}
}

export class VerifyResultCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly resultId: string,
    public readonly dto: VerifyResultDto,
  ) {}
}

export class ApproveResultCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly resultId: string,
    public readonly dto: ApproveResultDto,
  ) {}
}

export class ListPendingResultsQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly filters: { branchId?: string; page?: number; limit?: number },
  ) {}
}

export class GetSampleResultsQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly sampleId: string,
  ) {}
}
