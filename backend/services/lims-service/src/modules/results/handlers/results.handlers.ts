import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  EnterResultsCommand,
  VerifyResultCommand,
  ApproveResultCommand,
  ListPendingResultsQuery,
  GetSampleResultsQuery,
} from '../commands/results.commands';
import { ResultsService } from '../results.service';

@CommandHandler(EnterResultsCommand)
export class EnterResultsHandler implements ICommandHandler<EnterResultsCommand> {
  constructor(private readonly service: ResultsService) {}
  execute(cmd: EnterResultsCommand) {
    return this.service.enterResults(cmd.ctx, cmd.sampleId, cmd.dto);
  }
}

@CommandHandler(VerifyResultCommand)
export class VerifyResultHandler implements ICommandHandler<VerifyResultCommand> {
  constructor(private readonly service: ResultsService) {}
  execute(cmd: VerifyResultCommand) {
    return this.service.verifyResult(cmd.ctx, cmd.resultId, cmd.dto.notes);
  }
}

@CommandHandler(ApproveResultCommand)
export class ApproveResultHandler implements ICommandHandler<ApproveResultCommand> {
  constructor(private readonly service: ResultsService) {}
  execute(cmd: ApproveResultCommand) {
    return this.service.approveResult(cmd.ctx, cmd.resultId, cmd.dto.notes);
  }
}

@QueryHandler(ListPendingResultsQuery)
export class ListPendingResultsHandler implements IQueryHandler<ListPendingResultsQuery> {
  constructor(private readonly service: ResultsService) {}
  execute(query: ListPendingResultsQuery) {
    return this.service.listPendingResults(query.ctx, query.filters);
  }
}

@QueryHandler(GetSampleResultsQuery)
export class GetSampleResultsHandler implements IQueryHandler<GetSampleResultsQuery> {
  constructor(private readonly service: ResultsService) {}
  execute(query: GetSampleResultsQuery) {
    return this.service.getSampleResults(query.ctx, query.sampleId);
  }
}

export const ResultHandlers = [
  EnterResultsHandler,
  VerifyResultHandler,
  ApproveResultHandler,
  ListPendingResultsHandler,
  GetSampleResultsHandler,
];
