import axios from 'axios';
import * as crypto from 'crypto';
import { RazorpayAdapter } from './razorpay.adapter';
import { CashfreeAdapter } from './cashfree.adapter';
import { PayUAdapter } from './payu.adapter';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Payment gateway adapters', () => {
  const credentials = {
    apiKey: 'test_key',
    apiSecret: 'test_secret',
    webhookSecret: 'webhook_secret',
    isTestMode: true,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('RazorpayAdapter', () => {
    it('createOrder calls Razorpay API with amount in paise', async () => {
      const post = jest.fn().mockResolvedValue({
        data: { id: 'order_123', amount: 100000, currency: 'INR', status: 'created' },
      });
      mockedAxios.create.mockReturnValue({ post, get: jest.fn() } as never);

      const adapter = new RazorpayAdapter(credentials);
      const result = await adapter.createOrder({
        amount: 1000,
        currency: 'INR',
        receipt: 'PAY-001',
      });

      expect(post).toHaveBeenCalledWith('/orders', expect.objectContaining({ amount: 100000 }));
      expect(result.orderId).toBe('order_123');
      expect(result.amount).toBe(1000);
    });

    it('verifyPayment validates HMAC signature', async () => {
      const paymentId = 'pay_123';
      const orderId = 'order_123';
      const signature = crypto
        .createHmac('sha256', credentials.apiSecret)
        .update(`${orderId}|${paymentId}`)
        .digest('hex');

      const get = jest.fn().mockResolvedValue({
        data: { id: paymentId, order_id: orderId, amount: 100000, status: 'captured' },
      });
      mockedAxios.create.mockReturnValue({ post: jest.fn(), get } as never);

      const adapter = new RazorpayAdapter(credentials);
      const result = await adapter.verifyPayment({ orderId, paymentId, signature });

      expect(result.verified).toBe(true);
      expect(result.amount).toBe(1000);
    });

    it('processWebhook verifies x-razorpay-signature', async () => {
      const body = { event: 'payment.captured', payload: { payment: { entity: { id: 'pay_1', order_id: 'ord_1', amount: 50000, status: 'captured' } } } };
      const rawBody = JSON.stringify(body);
      const signature = crypto
        .createHmac('sha256', credentials.webhookSecret)
        .update(rawBody)
        .digest('hex');

      mockedAxios.create.mockReturnValue({ post: jest.fn(), get: jest.fn() } as never);
      const adapter = new RazorpayAdapter(credentials);
      const result = await adapter.processWebhook({
        headers: { 'x-razorpay-signature': signature },
        body,
        rawBody: Buffer.from(rawBody),
      });

      expect(result.verified).toBe(true);
      expect(result.eventType).toBe('payment.captured');
    });

    it('refund calls Razorpay refund endpoint', async () => {
      const post = jest.fn().mockResolvedValue({
        data: { id: 'rfnd_1', payment_id: 'pay_1', amount: 50000, status: 'processed' },
      });
      mockedAxios.create.mockReturnValue({ post, get: jest.fn() } as never);

      const adapter = new RazorpayAdapter(credentials);
      const result = await adapter.refund({ paymentId: 'pay_1', amount: 500 });

      expect(post).toHaveBeenCalledWith('/payments/pay_1/refund', { amount: 50000 });
      expect(result.refundId).toBe('rfnd_1');
    });
  });

  describe('CashfreeAdapter', () => {
    it('createOrder sends client credentials in headers', async () => {
      const post = jest.fn().mockResolvedValue({
        data: { order_id: 'ord_cf_1', order_amount: 1000, order_currency: 'INR', cf_order_id: 'cf_1', order_status: 'ACTIVE' },
      });
      mockedAxios.create.mockReturnValue({ post, get: jest.fn() } as never);

      const adapter = new CashfreeAdapter(credentials);
      const result = await adapter.createOrder({
        amount: 1000,
        currency: 'INR',
        receipt: 'PAY-002',
      });

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({ 'x-client-id': 'test_key' }),
        }),
      );
      expect(result.orderId).toBe('ord_cf_1');
    });

    it('verifyPayment checks payment status from order payments', async () => {
      const get = jest.fn().mockResolvedValue({
        data: {
          data: [{
            cf_payment_id: 'cf_pay_1',
            order_id: 'ord_1',
            payment_amount: 1000,
            payment_status: 'SUCCESS',
          }],
        },
      });
      mockedAxios.create.mockReturnValue({ post: jest.fn(), get } as never);

      const adapter = new CashfreeAdapter(credentials);
      const result = await adapter.verifyPayment({
        orderId: 'ord_1',
        paymentId: 'cf_pay_1',
      });

      expect(result.verified).toBe(true);
    });
  });

  describe('PayUAdapter', () => {
    it('createOrder generates sha512 hash', async () => {
      const post = jest.fn().mockResolvedValue({ data: { status: 1, msg: 'Success' } });
      mockedAxios.create.mockReturnValue({ post } as never);

      const adapter = new PayUAdapter(credentials);
      const result = await adapter.createOrder({
        amount: 1000,
        currency: 'INR',
        receipt: 'TXN001',
        customer: { name: 'John', email: 'john@test.com' },
      });

      expect(post).toHaveBeenCalled();
      expect(result.orderId).toBe('TXN001');
    });

    it('verifyPayment calls PayU verify_payment command', async () => {
      const post = jest.fn().mockResolvedValue({
        data: {
          status: 1,
          transaction_details: {
            TXN001: { mihpayid: 'payu_1', txnid: 'TXN001', amt: '1000.00', status: 'success' },
          },
        },
      });
      mockedAxios.create.mockReturnValue({ post } as never);

      const adapter = new PayUAdapter(credentials);
      const result = await adapter.verifyPayment({
        orderId: 'TXN001',
        paymentId: 'payu_1',
      });

      expect(result.verified).toBe(true);
      expect(result.amount).toBe(1000);
    });
  });
});
