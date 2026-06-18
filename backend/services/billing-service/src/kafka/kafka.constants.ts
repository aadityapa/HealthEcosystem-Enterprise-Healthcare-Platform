export const EVENT_PUBLISHER = 'EVENT_PUBLISHER';

export const KAFKA_TOPICS = {
  BILLING: 'billing.events',
  LIMS: 'lims.events',
} as const;

export const BILLING_EVENT_TYPES = {
  INVOICE_CREATED: 'billing.invoice.created',
  INVOICE_ISSUED: 'billing.invoice.issued',
  INVOICE_VOIDED: 'billing.invoice.voided',
  PAYMENT_RECEIVED: 'billing.payment.received',
  PAYMENT_REFUNDED: 'billing.payment.refunded',
  CLAIM_SUBMITTED: 'billing.claim.submitted',
  CLAIM_SETTLED: 'billing.claim.settled',
  SETTLEMENT_CALCULATED: 'billing.settlement.calculated',
} as const;

export const LIMS_EVENT_TYPES = {
  ORDER_CREATED: 'lims.order.created',
} as const;
