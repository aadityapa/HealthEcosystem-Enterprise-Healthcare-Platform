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

interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

interface RazorpayPaymentResponse {
  id: string;
  order_id: string;
  amount: number;
  status: string;
  method: string;
}

interface RazorpayRefundResponse {
  id: string;
  payment_id: string;
  amount: number;
  status: string;
}

export class RazorpayAdapter implements PaymentGatewayAdapter {
  readonly provider = 'RAZORPAY';
  private readonly client: AxiosInstance;

  constructor(private readonly credentials: GatewayCredentials) {
    const baseURL = credentials.isTestMode
      ? 'https://api.razorpay.com/v1'
      : 'https://api.razorpay.com/v1';

    this.client = axios.create({
      baseURL,
      auth: {
        username: credentials.apiKey,
        password: credentials.apiSecret,
      },
      headers: { 'Content-Type': 'application/json' },
      timeout: 30000,
    });
  }

  async createOrder(req: CreateOrderRequest): Promise<CreateOrderResponse> {
    const { data } = await this.client.post<RazorpayOrderResponse>('/orders', {
      amount: Math.round(req.amount * 100),
      currency: req.currency,
      receipt: req.receipt,
      notes: req.notes,
    });

    return {
      orderId: data.id,
      amount: data.amount / 100,
      currency: data.currency,
      raw: data,
    };
  }

  async verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const body = `${req.orderId}|${req.paymentId}`;
    const expected = crypto
      .createHmac('sha256', this.credentials.apiSecret)
      .update(body)
      .digest('hex');

    const verified = req.signature === expected;

    const { data } = await this.client.get<RazorpayPaymentResponse>(
      `/payments/${req.paymentId}`,
    );

    return {
      verified: verified && data.status === 'captured',
      paymentId: data.id,
      orderId: data.order_id,
      amount: data.amount / 100,
      status: data.status,
      raw: data,
    };
  }

  async processWebhook(payload: WebhookPayload): Promise<WebhookResult> {
    const signature = String(payload.headers['x-razorpay-signature'] ?? '');
    const rawBody = payload.rawBody?.toString() ?? JSON.stringify(payload.body);
    const expected = crypto
      .createHmac('sha256', this.credentials.webhookSecret ?? this.credentials.apiSecret)
      .update(rawBody)
      .digest('hex');

    const body = payload.body as {
      event?: string;
      payload?: { payment?: { entity?: RazorpayPaymentResponse } };
    };

    const payment = body.payload?.payment?.entity;

    return {
      verified: signature === expected,
      eventType: body.event ?? 'unknown',
      paymentId: payment?.id,
      orderId: payment?.order_id,
      amount: payment ? payment.amount / 100 : undefined,
      status: payment?.status,
      raw: body,
    };
  }

  async refund(req: RefundRequest): Promise<RefundResponse> {
    const { data } = await this.client.post<RazorpayRefundResponse>(
      `/payments/${req.paymentId}/refund`,
      {
        amount: Math.round(req.amount * 100),
        notes: req.notes ? { reason: req.notes } : undefined,
      },
    );

    return {
      refundId: data.id,
      paymentId: data.payment_id,
      amount: data.amount / 100,
      status: data.status,
      raw: data,
    };
  }
}
