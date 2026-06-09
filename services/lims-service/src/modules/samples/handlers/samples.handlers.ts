import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CollectSampleCommand,
  ReceiveSampleCommand,
  ProcessSampleCommand,
  RejectSampleCommand,
  GetSampleQuery,
  GetSampleByBarcodeQuery,
  ListSamplesQuery,
  GetSampleEventsQuery,
} from '../commands/samples.commands';
import { SamplesService } from '../samples.service';

@CommandHandler(CollectSampleCommand)
export class CollectSampleHandler implements ICommandHandler<CollectSampleCommand> {
  constructor(private readonly service: SamplesService) {}
  execute(cmd: CollectSampleCommand) {
    return this.service.collectSample(cmd.ctx, cmd.sampleId, cmd.dto);
  }
}

@CommandHandler(ReceiveSampleCommand)
export class ReceiveSampleHandler implements ICommandHandler<ReceiveSampleCommand> {
  constructor(private readonly service: SamplesService) {}
  execute(cmd: ReceiveSampleCommand) {
    return this.service.receiveSample(cmd.ctx, cmd.sampleId, cmd.dto);
  }
}

@CommandHandler(ProcessSampleCommand)
export class ProcessSampleHandler implements ICommandHandler<ProcessSampleCommand> {
  constructor(private readonly service: SamplesService) {}
  execute(cmd: ProcessSampleCommand) {
    return this.service.processSample(cmd.ctx, cmd.sampleId, cmd.dto);
  }
}

@CommandHandler(RejectSampleCommand)
export class RejectSampleHandler implements ICommandHandler<RejectSampleCommand> {
  constructor(private readonly service: SamplesService) {}
  execute(cmd: RejectSampleCommand) {
    return this.service.rejectSample(cmd.ctx, cmd.sampleId, cmd.dto);
  }
}

@QueryHandler(GetSampleQuery)
export class GetSampleHandler implements IQueryHandler<GetSampleQuery> {
  constructor(private readonly service: SamplesService) {}
  execute(query: GetSampleQuery) {
    return this.service.getSample(query.ctx, query.sampleId);
  }
}

@QueryHandler(GetSampleByBarcodeQuery)
export class GetSampleByBarcodeHandler implements IQueryHandler<GetSampleByBarcodeQuery> {
  constructor(private readonly service: SamplesService) {}
  execute(query: GetSampleByBarcodeQuery) {
    return this.service.getSampleByBarcode(query.ctx, query.barcode);
  }
}

@QueryHandler(ListSamplesQuery)
export class ListSamplesHandler implements IQueryHandler<ListSamplesQuery> {
  constructor(private readonly service: SamplesService) {}
  execute(query: ListSamplesQuery) {
    return this.service.listSamples(query.ctx, query.filters);
  }
}

@QueryHandler(GetSampleEventsQuery)
export class GetSampleEventsHandler implements IQueryHandler<GetSampleEventsQuery> {
  constructor(private readonly service: SamplesService) {}
  execute(query: GetSampleEventsQuery) {
    return this.service.getSampleEvents(query.ctx, query.sampleId);
  }
}

export const SampleHandlers = [
  CollectSampleHandler,
  ReceiveSampleHandler,
  ProcessSampleHandler,
  RejectSampleHandler,
  GetSampleHandler,
  GetSampleByBarcodeHandler,
  ListSamplesHandler,
  GetSampleEventsHandler,
];
