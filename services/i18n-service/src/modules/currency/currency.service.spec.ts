import { BadRequestException } from '@nestjs/common';
import { CurrencyService } from './currency.service';

describe('CurrencyService', () => {
  let service: CurrencyService;

  beforeEach(() => {
    service = new CurrencyService();
  });

  it('converts INR to USD with stub rate', () => {
    const result = service.convert(8350, 'INR', 'USD');
    expect(result.converted).toBe(100);
    expect(result.source).toBe('stub');
  });

  it('converts AED to SAR', () => {
    const result = service.convert(100, 'AED', 'SAR');
    expect(result.from).toBe('AED');
    expect(result.to).toBe('SAR');
    expect(result.converted).toBeGreaterThan(0);
  });

  it('throws for unsupported currency', () => {
    expect(() => service.convert(100, 'INR', 'XYZ')).toThrow(BadRequestException);
  });
});
