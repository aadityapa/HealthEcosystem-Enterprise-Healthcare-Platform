import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  GenerateReportCommand,
  ReleaseReportCommand,
  GetReportQuery,
  ListReportsQuery,
} from '../commands/reports.commands';
import { ReportsService } from '../reports.service';

@CommandHandler(GenerateReportCommand)
export class GenerateReportHandler implements ICommandHandler<GenerateReportCommand> {
  constructor(private readonly service: ReportsService) {}
  execute(cmd: GenerateReportCommand) {
    return this.service.generateReport(cmd.ctx, cmd.sampleId, cmd.dto.templateId);
  }
}

@CommandHandler(ReleaseReportCommand)
export class ReleaseReportHandler implements ICommandHandler<ReleaseReportCommand> {
  constructor(private readonly service: ReportsService) {}
  execute(cmd: ReleaseReportCommand) {
    return this.service.releaseReport(cmd.ctx, cmd.reportId, cmd.dto.notes);
  }
}

@QueryHandler(GetReportQuery)
export class GetReportHandler implements IQueryHandler<GetReportQuery> {
  constructor(private readonly service: ReportsService) {}
  execute(query: GetReportQuery) {
    return this.service.getReport(query.ctx, query.reportId);
  }
}

@QueryHandler(ListReportsQuery)
export class ListReportsHandler implements IQueryHandler<ListReportsQuery> {
  constructor(private readonly service: ReportsService) {}
  execute(query: ListReportsQuery) {
    return this.service.listReports(query.ctx, query.filters);
  }
}

export const ReportHandlers = [
  GenerateReportHandler,
  ReleaseReportHandler,
  GetReportHandler,
  ListReportsHandler,
];
