import type { ConsentType, Gender } from '@health/db';
import type { Address } from '@health/shared-types';

export interface RegisterPatientPayload {
  tenantId: string;
  organizationId: string;
  branchId: string;
  userId: string;
  firstName: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: string;
  email?: string;
  phone: string;
  alternatePhone?: string;
  address?: Address;
  abhaNumber?: string;
  abhaAddress?: string;
  metadata?: Record<string, unknown>;
}

export class RegisterPatientCommand {
  constructor(public readonly payload: RegisterPatientPayload) {}
}

export interface UpdatePatientPayload {
  tenantId: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  userId: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  bloodGroup?: string;
  email?: string;
  phone?: string;
  alternatePhone?: string;
  address?: Address;
  abhaNumber?: string;
  abhaAddress?: string;
  photoUrl?: string;
  metadata?: Record<string, unknown>;
  status?: string;
}

export class UpdatePatientCommand {
  constructor(public readonly payload: UpdatePatientPayload) {}
}

export interface RecordConsentPayload {
  tenantId: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  userId: string;
  consentType: ConsentType;
  grantedAt?: string;
  expiresAt?: string;
  abdmArtefact?: Record<string, unknown>;
  ipAddress?: string;
}

export class RecordConsentCommand {
  constructor(public readonly payload: RecordConsentPayload) {}
}

export interface AddTimelineEventPayload {
  tenantId: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  userId: string;
  eventType: string;
  title: string;
  description?: string;
  referenceType?: string;
  referenceId?: string;
  occurredAt?: string;
}

export class AddTimelineEventCommand {
  constructor(public readonly payload: AddTimelineEventPayload) {}
}

export interface CreateVisitPayload {
  tenantId: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  userId: string;
  visitType: string;
  checkInAt?: string;
}

export class CreateVisitCommand {
  constructor(public readonly payload: CreateVisitPayload) {}
}

export interface LinkFamilyMemberPayload {
  tenantId: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  userId: string;
  relatedPatientId: string;
  relationship: string;
  familyCode?: string;
}

export class LinkFamilyMemberCommand {
  constructor(public readonly payload: LinkFamilyMemberPayload) {}
}

export interface CreateDocumentPayload {
  tenantId: string;
  organizationId: string;
  branchId: string;
  patientId: string;
  userId: string;
  documentType: string;
  fileName: string;
  s3Key: string;
  mimeType?: string;
}

export class CreatePatientDocumentCommand {
  constructor(public readonly payload: CreateDocumentPayload) {}
}
