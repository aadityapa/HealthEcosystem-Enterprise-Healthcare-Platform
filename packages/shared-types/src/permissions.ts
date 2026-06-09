export const PERMISSIONS = {
  PATIENT: {
    CREATE: 'patient.create',
    READ: 'patient.read',
    UPDATE: 'patient.update',
    DELETE: 'patient.delete',
    EXPORT: 'patient.export',
  },
  LIMS: {
    ORDER_CREATE: 'lims.order.create',
    ORDER_READ: 'lims.order.read',
    SAMPLE_COLLECT: 'lims.sample.collect',
    SAMPLE_PROCESS: 'lims.sample.process',
    RESULT_VERIFY: 'lims.result.verify',
    RESULT_APPROVE: 'lims.result.approve',
  },
  REPORT: {
    RELEASE: 'report.release',
    APPROVE: 'report.approve',
  },
  BILLING: {
    CREATE: 'billing.create',
    READ: 'billing.read',
    VOID: 'billing.void',
    REFUND: 'billing.refund',
    CLAIM_SUBMIT: 'billing.claim.submit',
    SETTLEMENT: 'billing.settlement',
    GST_REPORT: 'billing.gst.report',
    PAYMENT_COLLECT: 'billing.payment.collect',
  },
  MASTER: {
    READ: 'master.read',
    MANAGE: 'master.manage',
  },
  ADMIN: {
    USER_MANAGE: 'admin.user.manage',
    BRANCH_MANAGE: 'admin.branch.manage',
    TENANT_MANAGE: 'admin.tenant.manage',
  },
  AUDIT: {
    LOG_READ: 'audit.log.read',
  },
  DEVICE: {
    CREATE: 'device.create',
    READ: 'device.read',
    UPDATE: 'device.update',
    DELETE: 'device.delete',
    CONFIGURE: 'device.configure',
    MONITOR: 'device.monitor',
    RETRY: 'device.retry',
    MESSAGE_READ: 'device.message.read',
  },
  INVENTORY: {
    READ: 'inventory.read',
    MANAGE: 'inventory.manage',
    PO_APPROVE: 'inventory.po.approve',
    TRANSFER: 'inventory.transfer',
  },
  QC: {
    READ: 'qc.read',
    RUN: 'qc.run',
    CAPA_MANAGE: 'qc.capa.manage',
    CALIBRATE: 'qc.calibrate',
  },
  CRM: {
    READ: 'crm.read',
    MANAGE: 'crm.manage',
    CAMP_MANAGE: 'crm.camp.manage',
    SALES_TRACK: 'crm.sales.track',
  },
  EHR: {
    READ: 'ehr.read',
    APPOINTMENT: 'ehr.appointment',
    CONSULT: 'ehr.consult',
    PRESCRIBE: 'ehr.prescribe',
    TELECONSULT: 'ehr.teleconsult',
  },
  ABDM: {
    READ: 'abdm.read',
    ABHA_LINK: 'abdm.abha.link',
    CONSENT: 'abdm.consent',
    FHIR: 'abdm.fhir',
  },
  ANALYTICS: {
    READ: 'analytics.read',
    EXECUTIVE: 'analytics.executive',
    EXPORT: 'analytics.export',
  },
  AI: {
    READ: 'ai.read',
    CLINICAL: 'ai.clinical',
    OPERATIONAL: 'ai.operational',
    CHAT: 'ai.chat',
  },
  FIELD: {
    READ: 'field.read',
    MANAGE: 'field.manage',
    TRACK: 'field.track',
  },
  RADIOLOGY: {
    READ: 'radiology.read',
    STUDY: 'radiology.study',
    REPORT: 'radiology.report',
    PACS: 'radiology.pacs',
  },
  HRMS: {
    READ: 'hrms.read',
    MANAGE: 'hrms.manage',
    PAYROLL: 'hrms.payroll',
  },
  MARKETPLACE: {
    READ: 'marketplace.read',
    MANAGE: 'marketplace.manage',
    ORDER: 'marketplace.order',
  },
  OBSERVABILITY: {
    READ: 'observability.read',
    SLA_MANAGE: 'observability.sla.manage',
    TRACE_READ: 'observability.trace.read',
  },
  DATA: {
    READ: 'data.read',
    PIPELINE_MANAGE: 'data.pipeline.manage',
    EXPORT: 'data.export',
  },
  WORKFLOW: {
    READ: 'workflow.read',
    MANAGE: 'workflow.manage',
    TASK_COMPLETE: 'workflow.task.complete',
  },
  DMS: {
    READ: 'dms.read',
    UPLOAD: 'dms.upload',
    SIGN: 'dms.sign',
    RETENTION: 'dms.retention',
  },
  BRANDING: {
    READ: 'branding.read',
    MANAGE: 'branding.manage',
    FEATURE_TOGGLE: 'branding.feature.toggle',
  },
  AGENTS: {
    READ: 'agents.read',
    PATIENT: 'agents.patient',
    DOCTOR: 'agents.doctor',
    LAB: 'agents.lab',
    MANAGEMENT: 'agents.management',
  },
  I18N: {
    READ: 'i18n.read',
    MANAGE: 'i18n.manage',
    TRANSLATE: 'i18n.translate',
  },
  SECURITY: {
    READ: 'security.read',
    MANAGE: 'security.manage',
    SIEM: 'security.siem',
  },
  COMPLIANCE: {
    READ: 'compliance.read',
    MANAGE: 'compliance.manage',
    EVIDENCE: 'compliance.evidence',
  },
  CUSTOMER_SUCCESS: {
    READ: 'customer_success.read',
    MANAGE: 'customer_success.manage',
    SUPPORT: 'customer_success.support',
  },
  COMMERCIAL: {
    READ: 'commercial.read',
    MANAGE: 'commercial.manage',
    PARTNER: 'commercial.partner',
  },
} as const;

export type PermissionCode =
  | (typeof PERMISSIONS.PATIENT)[keyof typeof PERMISSIONS.PATIENT]
  | (typeof PERMISSIONS.LIMS)[keyof typeof PERMISSIONS.LIMS]
  | (typeof PERMISSIONS.REPORT)[keyof typeof PERMISSIONS.REPORT]
  | (typeof PERMISSIONS.BILLING)[keyof typeof PERMISSIONS.BILLING]
  | (typeof PERMISSIONS.ADMIN)[keyof typeof PERMISSIONS.ADMIN]
  | (typeof PERMISSIONS.AUDIT)[keyof typeof PERMISSIONS.AUDIT]
  | (typeof PERMISSIONS.DEVICE)[keyof typeof PERMISSIONS.DEVICE]
  | (typeof PERMISSIONS.MASTER)[keyof typeof PERMISSIONS.MASTER]
  | (typeof PERMISSIONS.INVENTORY)[keyof typeof PERMISSIONS.INVENTORY]
  | (typeof PERMISSIONS.QC)[keyof typeof PERMISSIONS.QC]
  | (typeof PERMISSIONS.CRM)[keyof typeof PERMISSIONS.CRM]
  | (typeof PERMISSIONS.EHR)[keyof typeof PERMISSIONS.EHR]
  | (typeof PERMISSIONS.ABDM)[keyof typeof PERMISSIONS.ABDM]
  | (typeof PERMISSIONS.ANALYTICS)[keyof typeof PERMISSIONS.ANALYTICS]
  | (typeof PERMISSIONS.AI)[keyof typeof PERMISSIONS.AI]
  | (typeof PERMISSIONS.FIELD)[keyof typeof PERMISSIONS.FIELD]
  | (typeof PERMISSIONS.RADIOLOGY)[keyof typeof PERMISSIONS.RADIOLOGY]
  | (typeof PERMISSIONS.HRMS)[keyof typeof PERMISSIONS.HRMS]
  | (typeof PERMISSIONS.MARKETPLACE)[keyof typeof PERMISSIONS.MARKETPLACE]
  | (typeof PERMISSIONS.OBSERVABILITY)[keyof typeof PERMISSIONS.OBSERVABILITY]
  | (typeof PERMISSIONS.DATA)[keyof typeof PERMISSIONS.DATA]
  | (typeof PERMISSIONS.WORKFLOW)[keyof typeof PERMISSIONS.WORKFLOW]
  | (typeof PERMISSIONS.DMS)[keyof typeof PERMISSIONS.DMS]
  | (typeof PERMISSIONS.BRANDING)[keyof typeof PERMISSIONS.BRANDING]
  | (typeof PERMISSIONS.AGENTS)[keyof typeof PERMISSIONS.AGENTS]
  | (typeof PERMISSIONS.I18N)[keyof typeof PERMISSIONS.I18N]
  | (typeof PERMISSIONS.SECURITY)[keyof typeof PERMISSIONS.SECURITY]
  | (typeof PERMISSIONS.COMPLIANCE)[keyof typeof PERMISSIONS.COMPLIANCE]
  | (typeof PERMISSIONS.CUSTOMER_SUCCESS)[keyof typeof PERMISSIONS.CUSTOMER_SUCCESS]
  | (typeof PERMISSIONS.COMMERCIAL)[keyof typeof PERMISSIONS.COMMERCIAL];

export const SYSTEM_ROLES = {
  TENANT_ADMIN: 'tenant_admin',
  BRANCH_ADMIN: 'branch_admin',
  LAB_TECHNICIAN: 'lab_technician',
  LAB_VERIFIER: 'lab_verifier',
  LAB_APPROVER: 'lab_approver',
  FRONT_DESK: 'front_desk',
  DOCTOR: 'doctor',
  PATIENT: 'patient',
  INVENTORY_MANAGER: 'inventory_manager',
  QC_MANAGER: 'qc_manager',
  CRM_MANAGER: 'crm_manager',
  EHR_DOCTOR: 'ehr_doctor',
  ANALYTICS_MANAGER: 'analytics_manager',
  AI_OPERATOR: 'ai_operator',
  PHLEBOTOMIST: 'phlebotomist',
  RADIOLOGIST: 'radiologist',
  HR_MANAGER: 'hr_manager',
} as const;
