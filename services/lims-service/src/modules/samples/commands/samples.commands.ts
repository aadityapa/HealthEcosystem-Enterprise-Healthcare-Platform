import type { LimsRequestContext } from '@/common/context/lims-context';
import type {
  CollectSampleDto,
  ReceiveSampleDto,
  ProcessSampleDto,
  RejectSampleDto,
} from '../dto/samples.dto';

export class CollectSampleCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly sampleId: string,
    public readonly dto: CollectSampleDto,
  ) {}
}

export class ReceiveSampleCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly sampleId: string,
    public readonly dto: ReceiveSampleDto,
  ) {}
}

export class ProcessSampleCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly sampleId: string,
    public readonly dto: ProcessSampleDto,
  ) {}
}

export class RejectSampleCommand {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly sampleId: string,
    public readonly dto: RejectSampleDto,
  ) {}
}

export class GetSampleQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly sampleId: string,
  ) {}
}

export class GetSampleByBarcodeQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly barcode: string,
  ) {}
}

export class ListSamplesQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly filters: {
      labOrderId?: string;
      status?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
  ) {}
}

export class GetSampleEventsQuery {
  constructor(
    public readonly ctx: LimsRequestContext,
    public readonly sampleId: string,
  ) {}
}
