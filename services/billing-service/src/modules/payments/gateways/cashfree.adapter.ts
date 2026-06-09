import axios, { type AxiosInstance } from 'axios';
import * as crypto from 'crypto';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  GatewayCredentials,
  PaymentGatewayAdapter,
  RefundRequest,
  RefundResponse,
  VerifyPaymentRequest,
  VerifyPaymentResponse,
  WebhookPayload,
  WebhookResult,
} from './gateway.types';

interface CashfreeOrderResponse {
  cf_order_id: string;
  order_id: string;
  order_amount: number;
  order_currency: string;
  order_status: string;
}

interface CashfreePaymentResponse {
  cf_payment_id: string;
  order_id: string;
  payment_amount: number;
  payment_status: string;
}

interface CashfreeRefundResponse {
  cf_refund_id: string;
  refund_id: string;
  payment_id: string;
  refund_amount: number;
  refund_status: string;
}

export class CashfreeAdapter implements PaymentGatewayAdapter {
  readonly provider = 'CASHFREE';
  private readonly client: AxiosInstance;
  private readonly apiVersion = '2023-08-01';

  constructor(private readonly credentials: GatewayCredentials) {
    const baseURL = credentials.isTestMode
      ? 'https://sandbox.cashfree.com/pg'
      : 'https://api.cashfree.com/pg';

    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': credentials.apiKey,
        'x-client-secret': credentials.apiSecret,
        'x-api-version': this.apiVersion,
      },
      timeout: 30000,
    });
  }

  async createOrder(req: CreateOrderRequest): Promise<CreateOrderResponse> {
    const { data } = await this.client.post<CashfreeOrderResponse>('/orders', {
      order_id: req.receipt,
      order_amount: req.amount,
      order_currency: req.currency,
      customer_details: {
        customer_name: req.customer?.name,
        customer_email: req.customer?.email,
        customer_phone: req.customer?.contact,
      },
      order_meta: { return_url: req.notes?.returnUrl },
    });

    return {
      orderId: data.order_id,
      amount: data.order_amount,
      currency: data.order_currency,
      raw: data,
    };
  }

  async verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const { data } = await this.client.get<{ data: CashfreePaymentResponse[] }>(
      `/orders/${req.orderId}/payments`,
    );

    const payment = data.data?.find(
      (p) => p.cf_payment_id === req.paymentId || p.order_id === req.orderId,
    );

    if (!payment) {
      return {
        verified: false,
        paymentId: req.paymentId,
        orderId: req.orderId,
        amount: 0,
        status: 'NOT_FOUND',
        raw: data,
      };
    }

    return {
      verified: payment.payment_status === 'SUCCESS',
      paymentId: payment.cf_payment_id,
      orderId: payment.order_id,
      amount: payment.payment_amount,
      status: payment.payment_status,
      raw: payment,
    };
  }

  async processWebhook(payload: WebhookPayload): Promise<WebhookResult> {
    const signature = String(payload.headers['x-webhook-signature'] ?? '');
    const timestamp = String(payload.headers['x-webhook-timestamp'] ?? '');
    const rawBody = payload.rawBody?.toString() ?? JSON.stringify(payload.body);

    const signedPayload = timestamp + rawBody;
    const expected = crypto
      .createHmac('sha256', this.credentials.webhookSecret ?? this.credentials.apiSecret)
      .update(signedPayload)
      .digest('base64');

    const body = payload.body as {
      type?: string;
      data?: {
        payment?: CashfreePaymentResponse;
        order?: { order_id: string; order_amount: number };
      };
    };

    const payment = body.data?.payment;

    return {
      verified: signature === expected,
      eventType: body.type ?? 'unknown',
      paymentId: payment?.cf_payment_id,
      orderId: payment?.order_id ?? body.data?.order?.order_id,
      amount: payment?.payment_amount ?? body.data?.order?.order_amount,
      status: payment?.payment_status,
      raw: body,
    };
  }

  async refund(req: RefundRequest): Promise<RefundResponse> {
    const refundId = `ref_${Date.now()}`;
    const { data } = await this.client.post<CashfreeRefundResponse>(
      `/orders/${req.paymentId}/refunds`,
      {
        refund_id: refundId,
        refund_amount: req.amount,
        refund_note: req.notes,
      },
    );

    return {
      refundId: data.refund_id ?? data.cf_refund_id,
      paymentId: data.payment_id,
      amount: data.refund_amount,
      status: data.refund_status,
      raw: data,
    };
  }
}
