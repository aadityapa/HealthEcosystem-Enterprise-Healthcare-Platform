import { BadRequestException, Injectable } from '@nestjs/common';

const STUB_RATES_TO_INR: Record<string, number> = {
  INR: 1,
  USD: 83.5,
  AED: 22.7,
  SAR: 22.3,
  SGD: 62.1,
  GBP: 105.8,
  EUR: 90.2,
};

@Injectable()
export class CurrencyService {
  convert(amount: number, from: string, to: string) {
    const fromCode = from.toUpperCase();
    const toCode = to.toUpperCase();

    const fromRate = STUB_RATES_TO_INR[fromCode];
    const toRate = STUB_RATES_TO_INR[toCode];

    if (!fromRate || !toRate) {
      throw new BadRequestException(`Unsupported currency pair: ${fromCode} → ${toCode}`);
    }

    const converted = (amount * fromRate) / toRate;
    const rate = fromRate / toRate;

    return {
      amount,
      from: fromCode,
      to: toCode,
      rate: Number(rate.toFixed(6)),
      converted: Number(converted.toFixed(2)),
      source: 'stub',
      asOf: new Date().toISOString(),
    };
  }
}
