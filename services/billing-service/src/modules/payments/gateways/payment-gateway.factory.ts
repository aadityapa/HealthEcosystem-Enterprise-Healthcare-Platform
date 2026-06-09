import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RazorpayAdapter } from './razorpay.adapter';
import { CashfreeAdapter } from './cashfree.adapter';
import { PayUAdapter } from './payu.adapter';
import type { GatewayCredentials, PaymentGatewayAdapter } from './gateway.types';

export type GatewayProvider = 'RAZORPAY' | 'CASHFREE' | 'PAYU';

@Injectable()
export class PaymentGatewayFactory {
  constructor(private readonly config: ConfigService) {}

  create(provider: GatewayProvider, credentials?: Partial<GatewayCredentials>): PaymentGatewayAdapter {
    const creds = this.resolveCredentials(provider, credentials);

    switch (provider) {
      case 'RAZORPAY':
        return new RazorpayAdapter(creds);
      case 'CASHFREE':
        return new CashfreeAdapter(creds);
      case 'PAYU':
        return new PayUAdapter(creds);
      default:
        throw new BadRequestException(`Unsupported payment gateway: ${provider}`);
    }
  }

  private resolveCredentials(
    provider: GatewayProvider,
    override?: Partial<GatewayCredentials>,
  ): GatewayCredentials {
    const envMap: Record<GatewayProvider, { key: string; secret: string; webhook?: string }> = {
      RAZORPAY: {
        key: 'RAZORPAY_KEY_ID',
        secret: 'RAZORPAY_KEY_SECRET',
        webhook: 'RAZORPAY_WEBHOOK_SECRET',
      },
      CASHFREE: {
        key: 'CASHFREE_APP_ID',
        secret: 'CASHFREE_SECRET_KEY',
        webhook: 'CASHFREE_WEBHOOK_SECRET',
      },
      PAYU: {
        key: 'PAYU_MERCHANT_KEY',
        secret: 'PAYU_SALT',
        webhook: 'PAYU_WEBHOOK_SECRET',
      },
    };

    const env = envMap[provider];
    const apiKey = override?.apiKey ?? this.config.get<string>(env.key) ?? '';
    const apiSecret = override?.apiSecret ?? this.config.get<string>(env.secret) ?? '';

    if (!apiKey || !apiSecret) {
      throw new BadRequestException(`Missing credentials for ${provider} payment gateway`);
    }

    return {
      apiKey,
      apiSecret,
      webhookSecret: override?.webhookSecret ?? this.config.get<string>(env.webhook ?? ''),
      isTestMode: override?.isTestMode ?? this.config.get<string>('PAYMENT_GATEWAY_TEST_MODE') !== 'false',
    };
  }
}
