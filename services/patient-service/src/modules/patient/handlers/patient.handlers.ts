import { CommandHandler, ICommandHandler, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import type {
  Patient,
  PatientConsent,
  PatientDocument,
  PatientTimelineEvent,
  PatientVisit,
} from '@health/db';
import {
  RegisterPatientCommand,
  UpdatePatientCommand,
  RecordConsentCommand,
  AddTimelineEventCommand,
  CreateVisitCommand,
  LinkFamilyMemberCommand,
  CreatePatientDocumentCommand,
} from '../commands/patient.commands';
import {
  GetPatientQuery,
  SearchPatientsQuery,
  GetPatientTimelineQuery,
  GetPatientVisitsQuery,
  ListPatientDocumentsQuery,
} from '../queries/patient.queries';
import { PatientService } from '../patient.service';

@CommandHandler(RegisterPatientCommand)
export class RegisterPatientHandler
  implements ICommandHandler<RegisterPatientCommand>
{
  constructor(private readonly patientService: PatientService) {}

  execute(command: RegisterPatientCommand): Promise<Patient> {
    return this.patientService.registerPatient(command.payload);
  }
}

@CommandHandler(UpdatePatientCommand)
export class UpdatePatientHandler
  implements ICommandHandler<UpdatePatientCommand>
{
  constructor(private readonly patientService: PatientService) {}

  execute(command: UpdatePatientCommand): Promise<Patient> {
    return this.patientService.updatePatient(command.payload);
  }
}

@CommandHandler(RecordConsentCommand)
export class RecordConsentHandler
  implements ICommandHandler<RecordConsentCommand>
{
  constructor(private readonly patientService: PatientService) {}

  execute(command: RecordConsentCommand): Promise<PatientConsent> {
    return this.patientService.recordConsent(command.payload);
  }
}

@CommandHandler(AddTimelineEventCommand)
export class AddTimelineEventHandler
  implements ICommandHandler<AddTimelineEventCommand>
{
  constructor(private readonly patientService: PatientService) {}

  execute(command: AddTimelineEventCommand): Promise<PatientTimelineEvent> {
    return this.patientService.addTimelineEvent(command.payload);
  }
}

@CommandHandler(CreateVisitCommand)
export class CreateVisitHandler implements ICommandHandler<CreateVisitCommand> {
  constructor(private readonly patientService: PatientService) {}

  execute(command: CreateVisitCommand): Promise<PatientVisit> {
    return this.patientService.createVisit(command.payload);
  }
}

@CommandHandler(LinkFamilyMemberCommand)
export class LinkFamilyMemberHandler
  implements ICommandHandler<LinkFamilyMemberCommand>
{
  constructor(private readonly patientService: PatientService) {}

  execute(command: LinkFamilyMemberCommand): Promise<{
    family: { id: string };
    members: unknown[];
  }> {
    return this.patientService.linkFamilyMember(command.payload);
  }
}

@CommandHandler(CreatePatientDocumentCommand)
export class CreatePatientDocumentHandler
  implements ICommandHandler<CreatePatientDocumentCommand>
{
  constructor(private readonly patientService: PatientService) {}

  execute(command: CreatePatientDocumentCommand): Promise<PatientDocument> {
    return this.patientService.createDocument(command.payload);
  }
}

@QueryHandler(GetPatientQuery)
export class GetPatientHandler implements IQueryHandler<GetPatientQuery> {
  constructor(private readonly patientService: PatientService) {}

  execute(
    query: GetPatientQuery,
  ): ReturnType<PatientService['getPatient']> {
    return this.patientService.getPatient(query.tenantId, query.patientId);
  }
}

@QueryHandler(SearchPatientsQuery)
export class SearchPatientsHandler
  implements IQueryHandler<SearchPatientsQuery>
{
  constructor(private readonly patientService: PatientService) {}

  execute(query: SearchPatientsQuery) {
    return this.patientService.searchPatients(
      query.tenantId,
      query.query,
      query.page,
      query.limit,
    );
  }
}

@QueryHandler(GetPatientTimelineQuery)
export class GetPatientTimelineHandler
  implements IQueryHandler<GetPatientTimelineQuery>
{
  constructor(private readonly patientService: PatientService) {}

  execute(query: GetPatientTimelineQuery) {
    return this.patientService.getPatientTimeline(
      query.tenantId,
      query.patientId,
      query.page,
      query.limit,
    );
  }
}

@QueryHandler(GetPatientVisitsQuery)
export class GetPatientVisitsHandler
  implements IQueryHandler<GetPatientVisitsQuery>
{
  constructor(private readonly patientService: PatientService) {}

  execute(query: GetPatientVisitsQuery) {
    return this.patientService.getPatientVisits(
      query.tenantId,
      query.patientId,
      query.page,
      query.limit,
    );
  }
}

@QueryHandler(ListPatientDocumentsQuery)
export class ListPatientDocumentsHandler
  implements IQueryHandler<ListPatientDocumentsQuery>
{
  constructor(private readonly patientService: PatientService) {}

  execute(query: ListPatientDocumentsQuery) {
    return this.patientService.listDocuments(query.tenantId, query.patientId);
  }
}
