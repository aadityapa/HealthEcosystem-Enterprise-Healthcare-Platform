export interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  notes?: Record<string, string>;
  customer?: { name?: string; email?: string; contact?: string };
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  raw: unknown;
}

export interface VerifyPaymentRequest {
  orderId: string;
  paymentId: string;
  signature?: string;
}

export interface VerifyPaymentResponse {
  verified: boolean;
  paymentId: string;
  orderId: string;
  amount: number;
  status: string;
  raw: unknown;
}

export interface WebhookPayload {
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  rawBody?: Buffer;
}

export interface WebhookResult {
  verified: boolean;
  eventType: string;
  paymentId?: string;
  orderId?: string;
  amount?: number;
  status?: string;
  raw: unknown;
}

export interface RefundRequest {
  paymentId: string;
  amount: number;
  notes?: string;
}

export interface RefundResponse {
  refundId: string;
  paymentId: string;
  amount: number;
  status: string;
  raw: unknown;
}

export interface PaymentGatewayAdapter {
  readonly provider: string;
  createOrder(req: CreateOrderRequest): Promise<CreateOrderResponse>;
  verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResponse>;
  processWebhook(payload: WebhookPayload): Promise<WebhookResult>;
  refund(req: RefundRequest): Promise<RefundResponse>;
}

export interface GatewayCredentials {
  apiKey: string;
  apiSecret: string;
  webhookSecret?: string;
  isTestMode?: boolean;
}
