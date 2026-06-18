import type { LimsRequestContext } from '@/common/context/lims-context';
import type { GenerateReportDto, ReleaseReportDto } from '../dto/reports.dto';

export class GenerateReportCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly sampleId: string,
    public readonly dto: GenerateReportDto,
  ) {}
}

export class ReleaseReportCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly reportId: string,
    public readonly dto: ReleaseReportDto,
  ) {}
}

export class GetReportQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly reportId: string,
  ) {}
}

export class ListReportsQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly filters: {
      labOrderId?: string;
      sampleId?: string;
      status?: string;
      page?: number;
      limit?: number;
    },
  ) {}
}
