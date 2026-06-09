import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { PatientController } from './patient.controller';
import { PatientService } from './patient.service';
import {
  RegisterPatientHandler,
  UpdatePatientHandler,
  RecordConsentHandler,
  AddTimelineEventHandler,
  CreateVisitHandler,
  LinkFamilyMemberHandler,
  CreatePatientDocumentHandler,
  GetPatientHandler,
  SearchPatientsHandler,
  GetPatientTimelineHandler,
  GetPatientVisitsHandler,
  ListPatientDocumentsHandler,
} from './handlers/patient.handlers';

const CommandHandlers = [
  RegisterPatientHandler,
  UpdatePatientHandler,
  RecordConsentHandler,
  AddTimelineEventHandler,
  CreateVisitHandler,
  LinkFamilyMemberHandler,
  CreatePatientDocumentHandler,
];

const QueryHandlers = [
  GetPatientHandler,
  SearchPatientsHandler,
  GetPatientTimelineHandler,
  GetPatientVisitsHandler,
  ListPatientDocumentsHandler,
];

@Module({
  imports: [CqrsModule],
  controllers: [PatientController],
  providers: [PatientService, ...CommandHandlers, ...QueryHandlers],
  exports: [PatientService],
})
export class PatientModule {}
