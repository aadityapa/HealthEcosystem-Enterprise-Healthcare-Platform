export interface DomainEvent<T = unknown> {
  eventId: string;
  eventType: string;
  aggregateId: string;
  aggregateType: string;
  tenantId: string;
  organizationId?: string;
  branchId?: string;
  userId?: string;
  payload: T;
  occurredAt: string;
  version: number;
}

export interface PatientRegisteredEvent {
  patientId: string;
  uhid: string;
  firstName: string;
  lastName?: string;
  phone: string;
}

export interface LabOrderCreatedEvent {
  orderId: string;
  orderNumber: string;
  patientId: string;
  branchId: string;
  itemCount: number;
  totalAmount: number;
}

export interface SampleStatusChangedEvent {
  sampleId: string;
  barcode: string;
  fromStatus: string;
  toStatus: string;
  branchId: string;
}

export interface ResultVerifiedEvent {
  resultId: string;
  sampleId: string;
  parameterId: string;
  flag: string;
  verifiedBy: string;
}

export interface ReportReleasedEvent {
  reportId: string;
  reportNumber: string;
  sampleId: string;
  patientId: string;
  releasedBy: string;
}

export interface DeviceResultParsedEvent {
  deviceId: string;
  messageId: string;
  sampleBarcode: string;
  results: Array<{ parameterCode: string; value: string; unit?: string; rawValue?: string }>;
}

export interface DeviceResultImportedEvent {
  deviceId: string;
  sampleId: string;
  sampleBarcode: string;
  resultCount: number;
}

export interface DeviceOfflineEvent {
  deviceId: string;
  deviceCode: string;
  lastSeenAt: string;
}

export interface DeviceErrorEvent {
  deviceId: string;
  errorType: string;
  errorMessage: string;
  messageId?: string;
}

export interface InvoiceCreatedEvent {
  invoiceId: string;
  invoiceNumber: string;
  patientId?: string;
  corporateClientId?: string;
  totalAmount: number;
  invoiceType: string;
}

export interface PaymentReceivedEvent {
  paymentId: string;
  invoiceId: string;
  amount: number;
  method: string;
}

export interface UserLoggedInEvent {
  userId: string;
  email: string;
  ipAddress?: string;
  deviceId?: string;
}

export interface AuditLogCreatedEvent {
  auditLogId: string;
  action: string;
  entityType: string;
  entityId?: string;
  userId?: string;
}

export const EVENT_TYPES = {
  PATIENT_REGISTERED: 'patient.registered',
  PATIENT_UPDATED: 'patient.updated',
  LAB_ORDER_CREATED: 'lims.order.created',
  SAMPLE_COLLECTED: 'lims.sample.collected',
  SAMPLE_STATUS_CHANGED: 'lims.sample.status_changed',
  RESULT_VERIFIED: 'lims.result.verified',
  RESULT_APPROVED: 'lims.result.approved',
  REPORT_RELEASED: 'lims.report.released',
  USER_LOGGED_IN: 'auth.user.logged_in',
  USER_LOGGED_OUT: 'auth.user.logged_out',
  TENANT_CREATED: 'tenant.created',
  BRANCH_CREATED: 'tenant.branch.created',
  AUDIT_LOG_CREATED: 'audit.log.created',
  DEVICE_REGISTERED: 'device.registered',
  DEVICE_MESSAGE_RECEIVED: 'device.message.received',
  DEVICE_RESULT_PARSED: 'device.result_parsed',
  DEVICE_RESULT_IMPORTED: 'device.result.imported',
  DEVICE_ERROR: 'device.error',
  DEVICE_OFFLINE: 'device.offline',
  DEVICE_HEARTBEAT: 'device.heartbeat',
  INVOICE_CREATED: 'billing.invoice.created',
  INVOICE_VOIDED: 'billing.invoice.voided',
  PAYMENT_RECEIVED: 'billing.payment.received',
  CLAIM_SUBMITTED: 'billing.claim.submitted',
  CLAIM_SETTLED: 'billing.claim.settled',
  SETTLEMENT_CALCULATED: 'billing.settlement.calculated',
  MASTER_DATA_UPDATED: 'master.data.updated',
  STOCK_LOW: 'inventory.stock.low',
  STOCK_EXPIRED: 'inventory.stock.expired',
  PO_APPROVED: 'inventory.po.approved',
  QC_FAILED: 'qc.run.failed',
  QC_VIOLATION: 'qc.westgard.violation',
  CAPA_CREATED: 'qc.capa.created',
  REFERRAL_CREATED: 'crm.referral.created',
  CAMP_REGISTERED: 'crm.camp.registered',
  LEAD_WON: 'crm.lead.won',
  APPOINTMENT_BOOKED: 'ehr.appointment.booked',
  CONSULTATION_COMPLETED: 'ehr.consultation.completed',
  PRESCRIPTION_ISSUED: 'ehr.prescription.issued',
  ABHA_LINKED: 'abdm.abha.linked',
  CONSENT_GRANTED: 'abdm.consent.granted',
  FHIR_PUBLISHED: 'abdm.fhir.published',
  ANALYTICS_VIEW_REFRESHED: 'analytics.view.refreshed',
  AI_INFERENCE_COMPLETED: 'ai.inference.completed',
  ROUTE_STARTED: 'field.route.started',
  COLLECTION_COMPLETED: 'field.collection.completed',
  STUDY_REPORTED: 'radiology.study.reported',
  PAYROLL_PROCESSED: 'hrms.payroll.processed',
  MARKETPLACE_ORDER_PLACED: 'marketplace.order.placed',
  TRACE_INGESTED: 'observability.trace.ingested',
  SLA_BREACHED: 'observability.sla.breached',
  PIPELINE_COMPLETED: 'data.pipeline.completed',
  WORKFLOW_STARTED: 'workflow.instance.started',
  WORKFLOW_ESCALATED: 'workflow.task.escalated',
  DOCUMENT_SIGNED: 'dms.document.signed',
  BRAND_UPDATED: 'branding.brand.updated',
  AGENT_SESSION_STARTED: 'agents.session.started',
  LOCALE_CHANGED: 'i18n.locale.changed',
  SECURITY_INCIDENT_CREATED: 'security.incident.created',
  SECURITY_THREAT_DETECTED: 'security.threat.detected',
  SECURITY_VULN_SCAN_COMPLETED: 'security.vuln_scan.completed',
  COMPLIANCE_CONTROL_ASSESSED: 'compliance.control.assessed',
  COMPLIANCE_EVIDENCE_UPLOADED: 'compliance.evidence.uploaded',
  ONBOARDING_STEP_COMPLETED: 'customer_success.onboarding.step_completed',
  SUPPORT_TICKET_CREATED: 'customer_success.ticket.created',
  SUBSCRIPTION_ACTIVATED: 'commercial.subscription.activated',
  QUOTATION_SENT: 'commercial.quotation.sent',
  PARTNER_CONTRACT_SIGNED: 'commercial.contract.signed',
} as const;
