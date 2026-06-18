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

interface PayUOrderResponse {
  status: number;
  msg: string;
  payment_id?: string;
  txnid?: string;
}

interface PayUVerifyResponse {
  status: number;
  transaction_details?: Record<
    string,
    {
      mihpayid: string;
      txnid: string;
      amt: string;
      status: string;
    }
  >;
}

interface PayURefundResponse {
  status: number;
  msg: string;
  request_id?: string;
}

export class PayUAdapter implements PaymentGatewayAdapter {
  readonly provider = 'PAYU';
  private readonly client: AxiosInstance;
  private readonly paymentUrl: string;

  constructor(private readonly credentials: GatewayCredentials) {
    this.paymentUrl = credentials.isTestMode
      ? 'https://test.payu.in'
      : 'https://secure.payu.in';

    this.client = axios.create({
      baseURL: this.paymentUrl,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 30000,
    });
  }

  private hash(params: Record<string, string>): string {
    const hashString = [
      this.credentials.apiKey,
      params.txnid,
      params.amount,
      params.productinfo,
      params.firstname,
      params.email,
      params.udf1 ?? '',
      params.udf2 ?? '',
      params.udf3 ?? '',
      params.udf4 ?? '',
      params.udf5 ?? '',
      '',
      this.credentials.apiSecret,
    ].join('|');

    return crypto.createHash('sha512').update(hashString).digest('hex');
  }

  async createOrder(req: CreateOrderRequest): Promise<CreateOrderResponse> {
    const txnid = req.receipt;
    const params: Record<string, string> = {
      key: this.credentials.apiKey,
      txnid,
      amount: req.amount.toFixed(2),
      productinfo: req.notes?.productinfo ?? 'Lab Services',
      firstname: req.customer?.name ?? 'Customer',
      email: req.customer?.email ?? 'customer@example.com',
      phone: req.customer?.contact ?? '9999999999',
      surl: req.notes?.successUrl ?? '',
      furl: req.notes?.failureUrl ?? '',
    };
    params.hash = this.hash(params);

    const { data } = await this.client.post<PayUOrderResponse>(
      '/_payment',
      new URLSearchParams(params).toString(),
    );

    return {
      orderId: txnid,
      amount: req.amount,
      currency: req.currency,
      raw: data,
    };
  }

  async verifyPayment(req: VerifyPaymentRequest): Promise<VerifyPaymentResponse> {
    const command = 'verify_payment';
    const var1 = req.orderId;
    const hashString = `${this.credentials.apiKey}|${command}|${var1}|${this.credentials.apiSecret}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    const { data } = await this.client.post<PayUVerifyResponse>(
      '/merchant/postservice?form=2',
      new URLSearchParams({
        key: this.credentials.apiKey,
        command,
        var1,
        hash,
      }).toString(),
    );

    const txn = data.transaction_details?.[req.orderId];
    const verified = txn?.status === 'success';

    return {
      verified,
      paymentId: txn?.mihpayid ?? req.paymentId,
      orderId: txn?.txnid ?? req.orderId,
      amount: txn ? parseFloat(txn.amt) : 0,
      status: txn?.status ?? 'unknown',
      raw: data,
    };
  }

  async processWebhook(payload: WebhookPayload): Promise<WebhookResult> {
    const body = payload.body as Record<string, string>;
    const hashString = [
      this.credentials.apiSecret,
      body.status,
      '',
      '',
      '',
      '',
      '',
      body.udf5 ?? '',
      body.udf4 ?? '',
      body.udf3 ?? '',
      body.udf2 ?? '',
      body.udf1 ?? '',
      body.email ?? '',
      body.firstname ?? '',
      body.productinfo ?? '',
      body.amount ?? '',
      body.txnid ?? '',
      this.credentials.apiKey,
    ].join('|');

    const expected = crypto.createHash('sha512').update(hashString).digest('hex');
    const verified = body.hash === expected;

    return {
      verified,
      eventType: body.status === 'success' ? 'payment.success' : 'payment.failed',
      paymentId: body.mihpayid,
      orderId: body.txnid,
      amount: body.amount ? parseFloat(body.amount) : undefined,
      status: body.status,
      raw: body,
    };
  }

  async refund(req: RefundRequest): Promise<RefundResponse> {
    const command = 'cancel_refund_transaction';
    const var1 = req.paymentId;
    const var2 = crypto.randomUUID().slice(0, 12);
    const var3 = req.amount.toFixed(2);
    const hashString = `${this.credentials.apiKey}|${command}|${var1}|${this.credentials.apiSecret}`;
    const hash = crypto.createHash('sha512').update(hashString).digest('hex');

    const { data } = await this.client.post<PayURefundResponse>(
      '/merchant/postservice?form=2',
      new URLSearchParams({
        key: this.credentials.apiKey,
        command,
        var1,
        var2,
        var3,
        hash,
      }).toString(),
    );

    return {
      refundId: data.request_id ?? var2,
      paymentId: req.paymentId,
      amount: req.amount,
      status: data.status === 1 ? 'SUCCESS' : 'FAILED',
      raw: data,
    };
  }
}
